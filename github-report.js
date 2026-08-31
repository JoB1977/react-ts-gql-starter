import dotenv from 'dotenv';
import { readFile, writeFile } from 'node:fs/promises';

dotenv.config('./');

const TOKEN = process.env['GITHUB_PERSONAL_ACCESS_TOKEN'];

const sleep = (s = 1) => new Promise((resolve) => setTimeout(resolve, s * 1000));

const cache = new Map();

const defaultSleepFor = 60;

const fetchGH = async (url, params = null, retry = 0) => {
  const query = new URLSearchParams(params || {}).toString();
  const completeUrl = `${url.startsWith('https://') ? '' : 'https://api.github.com'}/${url.replace(
    /^\/+/,
    '',
  )}`;
  const completeUrlWithParams = `${completeUrl}${query ? `?${query}` : ''}`;

  if (cache.has(completeUrlWithParams)) {
    return cache.get(completeUrlWithParams).clone();
  }

  // await sleep(0.5);
  const res = await fetch(completeUrlWithParams, { headers: { Authorization: `token ${TOKEN}` } });

  const ratelimitRemaining = +res.headers.get('x-ratelimit-remaining');
  const ratelimitReset = +res.headers.get('x-ratelimit-reset');
  const retryAfter = +res.headers.get('retry-after');

  let sleepFor = 0;
  if (ratelimitRemaining === 0) {
    sleepFor = ratelimitReset
      ? Math.max(ratelimitReset - Math.floor(Date.now() / 1000), defaultSleepFor)
      : defaultSleepFor;
    console.log(`  [rate limit] sleeping ${sleepFor}s until reset...`);
  }

  if (res.status === 403) {
    if (sleepFor) {
      // already computed
    } else if (retryAfter) {
      // Secondary rate limit / abuse detection
      sleepFor = retryAfter + 2;
      console.log(`  [secondary rate limit] sleeping ${sleepFor}s...`);
    } else {
      sleepFor = 60;
      console.log(`  [other rate limit] sleeping ${sleepFor}s...`);
    }

    if (retry < 10) {
      await sleep(sleepFor);
      return fetchGH(url, params, retry + 1);
    }
  }

  if (res.status >= 500 && retry < 10) {
    console.log(`  [server error ${res.status}] retrying in 5s...`);
    await sleep(5);
    return fetchGH(url, params, retry + 1);
  }

  if (sleepFor) {
    await sleep(sleepFor);
  }

  if (res.status >= 200 && res.status < 300) {
    cache.set(completeUrlWithParams, res);
    return res.clone();
  }

  return res;
};

const getGH = async (url, params) => {
  const res = await fetchGH(url, params);
  return res.status >= 200 && res.status < 300 ? await res.json() : null;
};

const getPaginated = async function* (url, params) {
  const responses = [];

  let nextParams = params;
  let nextUrl = url;
  while (nextUrl) {
    let res;
    let data;
    try {
      res = await fetchGH(nextUrl, nextParams);
      data = await res.json();
    } catch (error) {
      console.error('failed to fetch from github', { url: nextUrl, error });
      throw error;
    }

    if (Array.isArray(data)) {
      for (const item of data) {
        yield item;
      }
    } else {
      yield data;
    }

    responses.push(data);

    nextUrl = res.headers
      .get('link')
      ?.split(',')
      .filter((part) => part.includes('rel="next"'))
      .find((part) => part.match(/<([^>]+)>/)?.[1]);

    if (nextUrl) {
      nextParams = null;
      await sleep();
    }
  }

  return responses.flat();
};

// --------------------------------------------------------------------------
// Data gathering
// --------------------------------------------------------------------------

const getLastCommitForRepo = async (owner, repo, defaultBranch) => {
  if (!defaultBranch) {
    return null;
  }

  const data = await getGH(`/repos/${owner}/${repo}/commits`, {
    sha: defaultBranch,
    per_page: 1,
  });

  return data?.[0]?.commit;
};

const getContributors = async (owner, repo) => {
  const contributors = [];
  for await (const c of getPaginated(`/repos/${owner}/${repo}/contributors`, { anon: 'false' })) {
    contributors.push({ login: c.login ?? '(unknown)', contributions: c.contributions || 0 });
  }
  return contributors;
};

const getLastCommitForUser = async (username, orgName) => {
  const data = await getGH('/search/commits', {
    q: `author:${username} org:${orgName}`,
    sort: 'committer-date',
    order: 'desc',
    per_page: 1,
  });

  // Prüfen, ob Commits gefunden wurden
  const lastCommit = data?.items?.[0];
  return lastCommit
    ? {
        repo: lastCommit.repository.name,
        date: lastCommit.commit.committer.date,
        message: lastCommit.commit.message,
      }
    : null;
};

const gatherOrgRepos = async (org, params = {}) => {
  console.log(`\n=== Organization: ${org} ===`);
  const reposData = [];
  let repoCount = 0;
  let skipped = 0;

  const { dryRun, skipForks = true, skipArchived = true } = params;

  for await (const repo of getPaginated(`/orgs/${org}/repos`, { type: 'all' })) {
    repoCount++;
    const name = repo.name;

    if (skipArchived && repo.archived) {
      skipped++;
      continue;
    }
    if (skipForks && repo.fork) {
      skipped++;
      continue;
    }

    if (dryRun) {
      const flags = [
        repo.private ? ' (private)' : '',
        repo.archived ? ' (archived)' : '',
        repo.fork ? ' (fork)' : '',
      ].join('');
      console.log(`  [${repoCount}] ${org}/${name}${flags}`);
      reposData.push({
        org,
        repo: name,
        private: repo.private || false,
        archived: repo.archived || false,
        fork: repo.fork || false,
        default_branch: repo.default_branch,
        url: repo.html_url,
      });
      continue;
    }

    process.stdout.write(`  [${repoCount}] ${org}/${name} ... `);

    const lastCommit = await getLastCommitForRepo(org, name, repo.default_branch);
    const contributors = await getContributors(org, name);

    console.log(`last commit: ${lastCommit || 'n/a'}, contributors: ${contributors.length}`);

    reposData.push({
      org,
      repo: name,
      private: repo.private || false,
      archived: repo.archived || false,
      fork: repo.fork || false,
      default_branch: repo.default_branch,
      last_commit_date: lastCommit?.committer?.date || lastCommit?.author?.date,
      contributors,
      contributor_count: contributors.length,
      url: repo.html_url,
    });
  }

  const included = repoCount - skipped;
  console.log(
    `  -> ${org}: ${repoCount} repos found, ${included} included, ${skipped} skipped by filters`,
  );

  return reposData;
};

const gatherOrgMembers = async (org, params = {}) => {
  console.log(`\n=== Organization: ${org} ===`);
  const userData = [];
  let userCount = 0;

  const { dryRun } = params;

  for await (const user of getPaginated(`/orgs/${org}/members`, { type: 'all' })) {
    userCount++;
    const login = user.login;
    const userDetails = await getGH(`/users/${login}`);
    const lastCommit = await getLastCommitForUser(login, org);

    console.log(`${login} (${userDetails?.name}): last commit: ${lastCommit || 'n/a'}`);

    userData.push({
      org,
      login,
      name: userDetails?.name,
      lastCommit,
    });
  }

  return userData;
};

const dryRun = process.argv.includes('dry-run');

const orgs = ['allane-mobility', 'SLSE-IT'];

const generateReport = async () => {
  const report = {};

  for (const org of orgs) {
    const repos = await gatherOrgRepos(org, { dryRun });
    const users = await gatherOrgMembers(org);

    report[org] = {
      repos,
      users: users.map((user) => ({
        ...user,
        repos: repos
          .filter((r) => r.contributors.some((c) => c.login === user.login))
          .map((r) => ({ repo: r.repo })),
      })),
    };
  }

  await writeFile('./github-report.json', JSON.stringify(report, null, 2), { encoding: 'utf-8' });
};

const generateUserList = async () => {
  const reportStr = await readFile('./github-report.json', { encoding: 'utf-8' });
  const report = reportStr ? JSON.parse(reportStr) : null;

  if (!report) {
    return;
  }

  const userIds = new Set(orgs.flatMap((org) => report[org].users.map((u) => u.login)));

  const users = [...userIds].map((login) => {
    const orgUsers = orgs
      .map((org) => report[org].users.find((u) => u.login === login))
      .filter(Boolean);
    const user = orgUsers[0];

    return {
      login: user.login,
      name: user.name,
      orgs: orgUsers.map((u) => u.org),
      repos: orgUsers.flatMap((u) => u.repos?.map((r) => `${u.org}/${r.repo}`) ?? []),
      lastCommits: orgUsers
        .filter((u) => u.lastCommit)
        .map((u) => `${u.org}/${u.lastCommit.repo}:: ${u.lastCommit.date}`),
    };
  });

  await writeFile('./github-users.json', JSON.stringify(users, null, 2), { encoding: 'utf-8' });
};

await generateReport();
await generateUserList();

import dotenv from 'dotenv';
import { writeFile } from 'node:fs/promises';
dotenv.config('./');

const TOKEN = process.env['GITHUB_PERSONAL_ACCESS_TOKEN'];

const sleep = (ms = 1) => new Promise((resolve) => setTimeout(resolve, ms * 1000));

const cache = new Map();

const fetchGH = async (url, params = null, retry = 0) => {
  const query = new URLSearchParams(params || {});
  const completeUrl = `${url.startsWith('https://') ? '' : 'https://api.github.com'}/${url.replace(
    /^\/+/,
    '',
  )}`;
  const completeUrlWithParams = `${completeUrl}${query.keys().length ? `?${query}` : ''}`;

  if (params?.q?.includes('JoB1977')) {
    console.log('fetch GH', { url, params, completeUrlWithParams });
  }

  if (cache.has(completeUrlWithParams)) {
    return cache.get(completeUrlWithParams).clone();
  }

  const res = await fetch(completeUrlWithParams, { headers: { Authorization: `token ${TOKEN}` } });

  const now = Math.floor(Date.now() / 1000);
  const ratelimitMemaining = res.headers.get('x-ratelimit-remaining');
  const ratelimitReset = +res.headers.get('x-ratelimit-reset');
  if (res.status === 403 && ratelimitMemaining === '0') {
    const sleepFor = ratelimitReset ? Math.max(ratelimitReset - now, 1) + 2 : 60;
    console.log(`  [rate limit] sleeping ${sleepFor}s until reset...`);
    await sleep(sleepFor);
    return fetchGH(url);
  }

  // Secondary rate limit / abuse detection
  const retryAfter = res.headers.get('retry-after');
  if (res.status === 403 && retryAfter) {
    const sleepFor = (+retryAfter || 0) + 2;
    console.log(`  [secondary rate limit] sleeping ${sleepFor}s...`);
    await sleep(sleepFor);
    return fetchGH(url);
  }

  if (res.status >= 500 && retry < 10) {
    console.log(`  [server error ${res.status}] retrying in 5s...`);
    await sleep(5);
    return fetchGH(url, params, retry + 1);
  }

  if (res.status >= 200 && res.status < 300) {
    cache.set(completeUrlWithParams, res);
    return res.clone();
  }

  return res;
};

const getGH = async (url, params) => {
  const res = await fetchGH(url, params);
  const data = res.status >= 200 && res.status < 300 ? await res.json() : null;
  if (params?.q?.includes('JoB1977')) {
    console.log('get GH', { url, params, data });
  }
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

const getLastCommitDate = async (owner, repo, defaultBranch) => {
  if (!defaultBranch) {
    return null;
  }

  const data = await getGH(`/repos/${owner}/${repo}/commits`, {
    sha: defaultBranch,
    per_page: 1,
  });

  const commit = data?.[0]?.commit;
  const date = commit?.committer?.date || commit?.author?.date;
  return date || null;
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

    const lastCommit = await getLastCommitDate(org, name, repo.default_branch);
    const contributors = await getContributors(org, name);

    console.log(`last commit: ${lastCommit || 'n/a'}, contributors: ${contributors.length}`);

    reposData.push({
      org,
      repo: name,
      private: repo.private || false,
      archived: repo.archived || false,
      fork: repo.fork || false,
      default_branch: repo.default_branch,
      last_commit_date: lastCommit,
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

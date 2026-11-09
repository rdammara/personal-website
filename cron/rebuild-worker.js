// A tiny Cloudflare Worker that rebuilds albertdammara.com on a schedule, so new Notion
// posts, GitHub projects and resume changes appear without a code change.
//
// Set up in the Cloudflare dashboard (not deployed from this repo):
//   1. Pages project > Settings > Builds > Deploy hooks: add one for the "master" branch
//   2. Workers & Pages > Create > Worker: paste this file and deploy
//   3. The Worker's Settings > Variables and secrets: add DEPLOY_HOOK_URL (secret) = the hook URL
//   4. The Worker's Settings > Trigger events: add a cron trigger, "0 */3 * * *"
//      (every 3 hours: about 240 builds a month, inside the free plan's 500)

export default {
  async scheduled(_controller, env) {
    const res = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
    if (!res.ok) throw new Error(`Deploy hook answered ${res.status}`);
  },
};

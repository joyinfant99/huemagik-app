// Create a new file named proxy.js in your repo

const proxyUrl = "http://huemagik-backend-env.eba-dmg3y9rq.us-west-2.elasticbeanstalk.com";

export async function proxyFetch(path, options = {}) {
  const url = `${proxyUrl}${path}`;
  const response = await fetch(url, options);
  return response;
}
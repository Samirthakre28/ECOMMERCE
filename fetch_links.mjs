import https from 'node:https';

const queries = [
  'site:flipkart.com men black essential t shirt',
  'site:flipkart.com men utility jacket',
  'site:flipkart.com women silk wrap blouse',
  'site:flipkart.com women black trench coat',
  'site:flipkart.com men structured cargo pants',
  'site:flipkart.com women cashmere turtleneck',
  'site:flipkart.com men minimalist white sneaker',
  'site:flipkart.com women pleated midi skirt',
  'site:flipkart.com men textured knit polo',
  'site:flipkart.com women sculpted black blazer',
  'site:flipkart.com men geometric print shirt',
  'site:flipkart.com women high rise wide leg jeans',
  'site:flipkart.com men matte black watch',
  'site:flipkart.com women leather ankle boots',
  'site:flipkart.com women draped evening gown',
  'site:flipkart.com men oversized wool coat'
];

async function searchDuck(query) {
  return new Promise((resolve) => {
    https.get('https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query), (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        const matches = data.match(/href="([^"]*flipkart\.com[^"]*\/p\/[^"]*)"/);
        if (matches && matches[1]) {
          let url = decodeURIComponent(matches[1]);
          if(url.includes('uddg=')) url = url.split('uddg=')[1].split('&')[0];
          resolve(url);
        } else {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  for (const q of queries) {
    const url = await searchDuck(q);
    console.log(url);
    await new Promise(r => setTimeout(r, 1000));
  }
}
run();

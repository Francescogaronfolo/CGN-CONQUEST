// This is a public browser key, never a server credential. Restrict HTTP referrers
// and API scope in Google Cloud before setting GOOGLE_MAPS_BROWSER_KEY on Vercel.
export default function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const key=process.env.GOOGLE_MAPS_BROWSER_KEY||'';
 res.status(200).json({googleMapsBrowserKey:key});
}

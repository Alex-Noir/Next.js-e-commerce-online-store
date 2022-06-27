export default async (req, res) => {
  await fetch(`https://openexchangerates.org/api/latest.json?app_id=${process.env.OERAPI_ACCESS_KEY}`)
    .then(r => {
      if (r.status >= 400) {
        return r.json().then(errResData => {
          const err = new Error('Error')
          err.data = errResData
          throw err
        })
      }
      return r.json()
    })
    .then(data => res.status(200).json(data))
    .catch(err => res.status(404).json({ message: `Error: ${err}` }))
}
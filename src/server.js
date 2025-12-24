// import dotenv from 'dotenv';
import 'dotenv/config'
import app from './app.js'

// dotenv.config()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`)
})
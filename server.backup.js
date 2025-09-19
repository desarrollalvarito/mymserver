import app from './app.bakup.js'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
import './app.css'  // or whatever your CSS file is called
import App from './App.svelte'

const app = new App({
  target: document.getElementById('app')
})

export default app
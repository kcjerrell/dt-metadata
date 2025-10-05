export function increaseSize() {
	const size = parseInt(localStorage.getItem("baseSize"), 10) || 16
	const newSize = Math.min(28, size + 2)

  localStorage.setItem("baseSize", newSize.toString())
  document.documentElement.style.setProperty("--app-base-size", `${newSize}px`)
}

export function decreaseSize() {
  const size = parseInt(localStorage.getItem("baseSize"), 10) || 16
  const newSize = Math.max(12, size - 2)

  localStorage.setItem("baseSize", newSize.toString())
  document.documentElement.style.setProperty("--app-base-size", `${newSize}px`)
}
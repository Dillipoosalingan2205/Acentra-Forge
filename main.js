/**
 * Single-viewport landing page interactions & counting animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initCountUp()
  initMobileMenu()
})

/**
 * 4 Metrics Count-Up Animation
 * Ease: easeOutCubic
 * Duration: 1500 + i * 80 ms
 * Start offset: 480 + i * 90 ms
 */
function initCountUp() {
  const statItems = document.querySelectorAll('.stat-item')
  if (!statItems.length) return

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

  const statsConfig = [
    { target: 120, decimals: 0, suffix: 'ms' },
    { target: 99.99, decimals: 2, suffix: '%' },
    { target: 24, decimals: 0, suffix: '/7' },
    { target: 30, decimals: 0, suffix: ' Days' },
  ]

  let hasAnimated = false

  const animateStats = () => {
    if (hasAnimated) return
    hasAnimated = true

    statItems.forEach((item, i) => {
      const valueEl = item.querySelector('.stat-value')
      if (!valueEl) return

      const cfg = statsConfig[i] || { target: 0, decimals: 0, suffix: '' }
      const duration = 1500 + i * 80
      const delay = 480 + i * 90

      setTimeout(() => {
        let startTime = null

        const step = (now) => {
          if (!startTime) startTime = now
          const elapsed = now - startTime
          const progress = Math.min(elapsed / duration, 1)
          const eased = easeOutCubic(progress)
          const currentVal = eased * cfg.target

          valueEl.textContent = `${currentVal.toFixed(cfg.decimals)}${cfg.suffix}`

          if (progress < 1) {
            requestAnimationFrame(step)
          } else {
            valueEl.textContent = `${cfg.target.toFixed(cfg.decimals)}${cfg.suffix}`
          }
        }

        requestAnimationFrame(step)
      }, delay)
    })
  }

  // Check prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    statItems.forEach((item, i) => {
      const valueEl = item.querySelector('.stat-value')
      const cfg = statsConfig[i]
      if (valueEl && cfg) {
        valueEl.textContent = `${cfg.target.toFixed(cfg.decimals)}${cfg.suffix}`
      }
    })
    return
  }

  // IntersectionObserver threshold 0.25
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateStats()
          observer.disconnect()
        }
      })
    },
    { threshold: 0.25 }
  )

  const statsContainer = document.querySelector('.stats-footer')
  if (statsContainer) {
    observer.observe(statsContainer)
  } else {
    animateStats()
  }
}

/**
 * Mobile Sheet Menu Controller
 */
function initMobileMenu() {
  const burgerBtn = document.querySelector('.burger-btn')
  const overlay = document.querySelector('.mobile-overlay')
  const sheet = document.querySelector('.mobile-sheet')
  const navLinks = document.querySelectorAll('.mobile-nav-link, .mobile-sign-in')

  if (!burgerBtn || !overlay || !sheet) return

  const openMenu = () => {
    burgerBtn.setAttribute('aria-expanded', 'true')
    overlay.removeAttribute('hidden')
    sheet.removeAttribute('hidden')
    document.body.classList.add('menu-open')
  }

  const closeMenu = () => {
    burgerBtn.setAttribute('aria-expanded', 'false')
    overlay.setAttribute('hidden', '')
    sheet.setAttribute('hidden', '')
    document.body.classList.remove('menu-open')
  }

  burgerBtn.addEventListener('click', () => {
    const isExpanded = burgerBtn.getAttribute('aria-expanded') === 'true'
    if (isExpanded) {
      closeMenu()
    } else {
      openMenu()
    }
  })

  overlay.addEventListener('click', closeMenu)

  navLinks.forEach((link) => {
    link.addEventListener('click', closeMenu)
  })

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && burgerBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu()
    }
  })

  window.addEventListener('resize', () => {
    if (window.innerWidth > 720 && burgerBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu()
    }
  })
}

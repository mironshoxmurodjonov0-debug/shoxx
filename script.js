(() => {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  // Mobil menyu
  const mobileMenu = $("#mobileMenu");
  const navLinks = $("#navLinks");
  mobileMenu.addEventListener("click", () => {
    const opened = navLinks.classList.toggle("open");
    mobileMenu.setAttribute("aria-expanded", String(opened));
    mobileMenu.setAttribute("aria-label", opened ? "Menyuni yopish" : "Menyuni ochish");
  });
  $$("#navLinks a").forEach(link => link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    mobileMenu.setAttribute("aria-expanded", "false");
  }));

  // Qidiruv paneli va sahifadagi mos bo‘limlarni topish
  const searchPanel = $("#searchPanel");
  const searchInput = $("#searchInput");
  const searchResults = $("#searchResults");
  const searchable = [
    { name: "Mac", target: "#mac", words: "mac kompyuter noutbuk" },
    { name: "iPad", target: "#ipad", words: "planshet ipad" },
    { name: "iPhone", target: "#iphone", words: "telefon iphone" },
    { name: "Apple Watch", target: "#watch", words: "soat watch" },
    { name: "AirPods", target: "#airpods", words: "quloqchin airpods" },
    { name: "Apple Home", target: "#home", words: "uy home" },
    { name: "Aksessuarlar", target: "#accessories", words: "aksessuar g‘ilof" }
  ];
  function openSearch() {
    searchPanel.classList.add("open");
    searchPanel.setAttribute("aria-hidden", "false");
    setTimeout(() => searchInput.focus(), 100);
  }
  function closeSearch() {
    searchPanel.classList.remove("open");
    searchPanel.setAttribute("aria-hidden", "true");
  }
  $("#searchToggle").addEventListener("click", openSearch);
  $("#searchClose").addEventListener("click", closeSearch);
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLocaleLowerCase("uz");
    searchResults.innerHTML = "";
    if (!query) return;
    const matches = searchable.filter(item => (item.name + " " + item.words).toLocaleLowerCase("uz").includes(query));
    if (!matches.length) {
      searchResults.textContent = "Mos natija topilmadi.";
      return;
    }
    matches.forEach(item => {
      const a = document.createElement("a");
      a.href = item.target;
      a.textContent = item.name + " bo‘limiga o‘tish";
      a.addEventListener("click", closeSearch);
      searchResults.append(a);
    });
  });

  // Savat — namoyish uchun, haqiqiy to‘lovni amalga oshirmaydi
  const bagPanel = $("#bagPanel");
  const overlay = $("#overlay");
  const bagItems = [];
  const bagList = $("#bagItems");
  const bagEmpty = $("#bagEmpty");
  const bagCount = $("#bagCount");
  function renderBag() {
    bagList.innerHTML = "";
    bagEmpty.hidden = bagItems.length > 0;
    bagCount.textContent = String(bagItems.length);
    bagItems.forEach((name, index) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = name;
      const remove = document.createElement("button");
      remove.className = "remove-item";
      remove.textContent = "O‘chirish";
      remove.setAttribute("aria-label", name + " mahsulotini savatdan o‘chirish");
      remove.addEventListener("click", () => {
        bagItems.splice(index, 1);
        renderBag();
      });
      li.append(label, remove);
      bagList.append(li);
    });
  }
  function openBag() {
    bagPanel.classList.add("open");
    overlay.classList.add("open");
    bagPanel.setAttribute("aria-hidden", "false");
  }
  function closeBag() {
    bagPanel.classList.remove("open");
    overlay.classList.remove("open");
    bagPanel.setAttribute("aria-hidden", "true");
  }
  $("#bagToggle").addEventListener("click", openBag);
  $("#bagClose").addEventListener("click", closeBag);
  overlay.addEventListener("click", closeBag);
  $("#continueShopping").addEventListener("click", closeBag);
  $$(".bag-panel").forEach(panel => panel.addEventListener("keydown", e => {
    if (e.key === "Escape") closeBag();
  }));
  const toast = $("#toast");
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  $$("[data-add]").forEach(button => button.addEventListener("click", () => {
    bagItems.push(button.dataset.add);
    renderBag();
    notify(button.dataset.add + " savatga qo‘shildi");
  }));

  // Mustaqil karusel: har bir [data-carousel] o‘z holati va boshqaruviga ega
  $$(".carousel[data-carousel]").forEach(carousel => {
    const viewport = $(".carousel-viewport", carousel);
    const track = $(".carousel-track", carousel);
    const slides = $$(".show-card", track);
    const dots = $(".dots", carousel);
    const prev = $(".carousel-prev", carousel);
    const next = $(".carousel-next", carousel);
    let index = 0;
    let startX = 0;
    let deltaX = 0;
    let dragging = false;
    let pointerId = null;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", `${i + 1}-slayd`);
      dot.addEventListener("click", () => goTo(i));
      dots.append(dot);
    });
    const dotButtons = $$("button", dots);

    function stepSize() {
      if (!slides.length) return 0;
      const style = getComputedStyle(track);
      const gap = parseFloat(style.columnGap || style.gap) || 0;
      return slides[0].getBoundingClientRect().width + gap;
    }
    function goTo(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      track.style.transform = `translate3d(${-index * stepSize()}px,0,0)`;
      dotButtons.forEach((dot, i) => dot.setAttribute("aria-current", String(i === index)));
    }
    prev.addEventListener("click", () => goTo(index - 1));
    next.addEventListener("click", () => goTo(index + 1));
    viewport.addEventListener("keydown", e => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(index + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(index - 1); }
    });
    viewport.tabIndex = 0;
    viewport.addEventListener("pointerdown", e => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      startX = e.clientX;
      deltaX = 0;
      dragging = true;
      pointerId = e.pointerId;
      viewport.setPointerCapture(pointerId);
      track.style.transition = "none";
    });
    viewport.addEventListener("pointermove", e => {
      if (!dragging) return;
      deltaX = e.clientX - startX;
      track.style.transform = `translate3d(${-index * stepSize() + deltaX}px,0,0)`;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "";
      if (Math.abs(deltaX) > 45) goTo(index + (deltaX < 0 ? 1 : -1));
      else goTo(index);
      deltaX = 0;
    }
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    window.addEventListener("resize", () => goTo(index));
    goTo(0);
  });

  // Ko‘rinish hududiga kirganda yumshoq paydo bo‘lish
  const revealItems = $$(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add("visible"));
  }

  // Escape barcha ochiq panellarni yopadi
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      closeSearch();
      closeBag();
      navLinks.classList.remove("open");
      mobileMenu.setAttribute("aria-expanded", "false");
    }
  });
  renderBag();
})();
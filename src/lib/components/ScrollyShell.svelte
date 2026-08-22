<script>
  import { onMount } from "svelte";

  let { visual, children, onStepChange = () => {}, label = "Berättelsesteg", status = "", variant = "split" } = $props();
  let container;
  let active = -1;

  onMount(() => {
    const steps = [...container.querySelectorAll("[data-step]")];
    let visible = true;
    let ticking = false;

    const activate = (index) => {
      const closest = Math.max(0, Math.min(steps.length - 1, index));
      if (closest !== active) {
        active = closest;
        steps.forEach((step, index) => step.classList.toggle("is-active", index === active));
        onStepChange(active);
      }
    };

    const update = () => {
      ticking = false;
      if (!visible) return;
      const mobile = window.matchMedia("(max-width: 820px)").matches;
      const targetRatio = mobile ? (variant === "overlay" ? 0.72 : 0.90) : 0.52;
      const target = window.innerHeight * targetRatio;
      let closest = 0;
      let distance = Infinity;
      steps.forEach((step, index) => {
        const rect = step.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        const nextDistance = Math.abs(midpoint - target);
        if (nextDistance < distance) {
          distance = nextDistance;
          closest = index;
        }
      });
      activate(closest);
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestUpdate();
    }, { rootMargin: "80% 0px 80% 0px" });

    observer.observe(container);
    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  });
</script>

<div class="scrolly" class:overlay={variant === "overlay"} bind:this={container} aria-label={label}>
  <div class="visual">
    {@render visual()}
  </div>
  <div class="steps">
    {@render children()}
  </div>
  <p class="sr-only" aria-live="polite">{status}</p>
</div>

<style>
  .scrolly {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1.62fr) minmax(280px, 0.86fr);
    gap: clamp(24px, 5vw, 76px);
    align-items: start;
  }

  .visual {
    position: sticky;
    top: 0;
    height: 100svh;
    min-width: 0;
    display: grid;
    place-items: center;
    padding: clamp(16px, 3vw, 38px);
  }

  .steps {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 58svh;
    min-width: 0;
    padding-block: 28svh 66svh;
    pointer-events: none;
  }

  .steps :global([data-step]) { pointer-events: auto; }

  .scrolly.overlay { display:block; }
  .overlay .visual { z-index:1; width:100%; padding:0; }
  .overlay .steps {
    z-index:2;
    width:min(420px,calc(100% - 40px));
    margin-top:-100svh;
    margin-left:max(20px,calc((100vw - 1320px)/2));
    padding-block:22svh 72svh;
    gap:58svh;
  }

  @media (max-width: 820px) {
    .scrolly { grid-template-columns: minmax(0, 1fr); gap: 0; }
    .visual {
      z-index: 3;
      height: 66svh;
      min-height: 420px;
      padding: 10px 12px 16px;
      background: var(--scene);
      border-bottom: 1px solid var(--rule-strong);
    }
    .steps {
      padding: 14svh 16px 56svh;
      gap: 52svh;
    }
    .overlay .visual { height:100svh; min-height:520px; padding:0; border-bottom:0; }
    .overlay .steps {
      width:100%;
      margin-top:-100svh;
      margin-left:0;
      padding:55svh 12px 60svh;
      gap:58svh;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .visual { position: sticky; }
  }
</style>

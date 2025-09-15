import { Animation, createAnimation } from '@ionic/angular';

/**
 * Animación de FADE para transiciones de página
 */
export const fadeAnimation = (baseEl: HTMLElement, opts?: any): Animation => {
  const enteringAnimation = createAnimation()
    .addElement(opts.enteringEl)
    .fromTo('opacity', '0', '1')
    .duration(400);

  const leavingAnimation = createAnimation()
    .addElement(opts.leavingEl)
    .fromTo('opacity', '1', '0')
    .duration(400);

  return createAnimation()
    .addAnimation([enteringAnimation, leavingAnimation]);
};

/**
 * Animación de BOUNCE para notificaciones (Toasts)
 */
export const toastBounceInAnimation = (baseEl: HTMLElement): Animation => {
    const baseAnimation = createAnimation();
    const wrapperAnimation = createAnimation();
    const hostEl = baseEl.shadowRoot!.querySelector('.toast-container')!;
  
    wrapperAnimation.addElement(hostEl);
  
    wrapperAnimation.fromTo('opacity', 0.01, 1)
                    .fromTo('transform', 'translateY(100%)', 'translateY(0px)');
    
    return baseAnimation
      .easing('cubic-bezier(0.36,0.66,0.04,1)')
      .duration(400)
      .addAnimation(wrapperAnimation);
};
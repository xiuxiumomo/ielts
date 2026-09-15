import { DirectiveBinding, ObjectDirective } from "vue";

interface MyHTMLElement extends HTMLElement {
  __clickDisabled__: boolean;
  __originalPointerEvents__: string;
  __avoidRepeatHandler__: () => void;
}

const preventReClick: ObjectDirective = {
  mounted(el: MyHTMLElement, binding: DirectiveBinding) {
    function __avoidRepeatHandler__() {
      if (el.__clickDisabled__) return;
      el.__clickDisabled__ = true;
      el.__originalPointerEvents__ = el.style.pointerEvents;
      el.style.pointerEvents = "none";
      setTimeout(() => {
        el.__clickDisabled__ = false;
        el.style.pointerEvents = el.__originalPointerEvents__;
      }, binding.value || 1500);
    }
    el.addEventListener("click", __avoidRepeatHandler__);
    el.__avoidRepeatHandler__ = __avoidRepeatHandler__;
  },
  unmounted(el: MyHTMLElement) {
    el.removeEventListener("click", el.__avoidRepeatHandler__);
    el.__clickDisabled__ = false;
    el.__originalPointerEvents__ = "";
  },
};

export default preventReClick;

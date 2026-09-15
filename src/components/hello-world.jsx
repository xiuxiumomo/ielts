import { defineComponent, ref } from "vue";
import { makeNumericProp } from "@/utils/index";
export default defineComponent({
  props: {
    mtext: makeNumericProp(""),
  },
  emits: ["my-click"],
  setup(props, { attrs, slots, emit, expose }) {
    const text = ref("my val");
    const count = ref(0);

    const increment = () => {
      count.value++;
      emit("my-click", count.value);
    };
    return {
      text,
      increment,
      count,
    };
  },
  render(instance) {
    const { increment, count, mtext } = this;
    const { $slots } = instance;
    return (
      <>
        <div onClick={increment}>
          {mtext}-{this.text}-{count}
        </div>

        {$slots.default && <span>{$slots.default()}</span>}
        {$slots.test && <span>{$slots.test()}</span>}
      </>
    );
  },
});

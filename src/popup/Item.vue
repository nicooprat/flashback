<template>
  <a
    class="item block py-2 px-4"
    :class="{ 'has-focus': hasFocus }"
    :href="history.url"
    :title="history.url"
    @click.prevent="$emit('open', $event)"
    @focus="$emit('focus', $event)"
  >
    <span class="flex">
      <strong v-if="history.title" v-html="formattedTitle" />
      <span class="ml-auto pl-2 font-semibold text-gray-500">
        <span class="date" v-for="date in formattedDate" :key="date" v-text="date" />
      </span>
    </span>
    <small class="block text-gray-600 text-xs underline truncate">
      {{ history.url }}
    </small>
  </a>
</template>

<script>
export default {
  props: {
    history: {
      type: Object,
      required: true,
    },
    search: {
      type: String,
      default: '',
    },
    hasFocus: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formattedTitle() {
      if (!this.search) {
        return this.history.title
      }
      return this.history.title.replace(new RegExp(this.search, "gi"), (match) => `<mark>${match}</mark>`);
    },
    formattedDate() {
      const date = new Intl.DateTimeFormat(navigator.language).format(this.history.lastVisitTime)
      return date.split('/')
    }
  }
}
</script>

<style scoped>
a:hover,
a:focus,
a.has-focus {
  background: #EDF2F7;
  outline: none;
}

mark {
  background: #FEFCBF;
}

.date:not(:last-child):after {
  content: '/';
  opacity: .5;
  margin-left: 0.1em;
  margin-right: 0.1em;
}

</style>

<style src="../assets/tailwind.css">
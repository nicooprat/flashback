<template>
  <a
    class="item block py-2 px-4 relative"
    :class="{ 'has-focus': hasFocus }"
    :href="history.url"
    :title="history.url"
    @click.prevent="$emit('open', $event)"
    @focus="$emit('focus', $event)"
  >
    <span class="flex">
      <strong v-if="history.title" v-html="formattedTitle" />
      <span class="ml-auto pl-2 font-semibold text-gray-500 text-xs">
        <span class="date" v-for="date in formattedDate" :key="date" v-text="date" />
      </span>
    </span>
    <small class="block text-gray-600 text-xs underline truncate" v-html="formattedUrl" />
    <transition name="fade-out">
      <span v-if="hasCopied" class="flex items-center justify-center text-center absolute inset-0 bg-gray-200 text-gray-600">
        <svg class="opacity-75" width="12" height="12" viewBox="0 0 24 24"><path fill="currentColor" d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>
        <strong class="uppercase font-semibold ml-2 text-xs">URL copied</strong>
      </span>
    </transition>
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
    hasCopied: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formattedTitle() {
      if (!this.search) {
        return this.history.title
      }
      return this.replaceMark(this.history.title, this.search)
    },
    formattedUrl() {
      if (!this.search) {
        return this.history.url
      }
      return this.replaceMark(this.history.url, this.search)
    },
    formattedDate() {
      const date = new Intl.DateTimeFormat(navigator.language).format(this.history.lastVisitTime)
      return date.split('/')
    }
  },
  methods: {
    replaceMark(text, search) {
      return text.replace(new RegExp(search.replace(' ', '|'), "gi"), (match) => `<mark>${match}</mark>`)
    }
  }
}
</script>

<style scoped>
/* https://tailwindcss.com/docs/customizing-colors/#gray */
a:hover,
a:focus,
a.has-focus {
  @apply bg-gray-200 outline-none;
}

/* https://tailwindcss.com/docs/customizing-colors/#yellow */
/* /deep/ needed as mark are added by the component and isn't data-v */
a /deep/ mark {
  @apply bg-yellow-200;
}

.date:not(:last-child):after {
  content: '/';
  opacity: .5;
  margin-left: 0.1em;
  margin-right: 0.1em;
}

.fade-out-leave-active {
  transition: opacity 300ms;
}

.fade-out-leave-to {
  opacity: 0;
}
</style>

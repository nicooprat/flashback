<template>
  <form
    class="text-gray-800 text-sm"
    @keydown.up.prevent.stop="up"
    @keydown.down.prevent.stop="down"
    @keydown.enter.prevent.stop="open"
  >
    <input
      class="w-full py-2 px-4 border-b border-gray-200 sticky top-0 z-10 focus:outline-none"
      type="text"
      autofocus
      placeholder="Search history..."
      v-model="search"
      @input="handleInput"
    >
    <nav v-if="histories.length" ref="nav" :class="{ 'opacity-50': isInitialLoading }">
      <Item
        v-for="(history, index) in histories"
        :key="history.id"
        :search="searchDelayed"
        :history="history"
        :hasFocus="index === focus"
        :hasCopied="copied === index"
        @focus="focus = index"
        @open="open"
      />
    </nav>
    <p v-else-if="!canLoadMore" class="text-gray-500 py-2 px-4">
      No result
    </p>
    <p v-if="canLoadMore" class="text-gray-500 py-2 px-4">
      Loading previous items...
    </p>
    <div ref="intersect" />
  </form>
</template>

<script>
import Item from './Item'

const debounce = (fn, wait = 1) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn.call(this, ...args), wait)
  }
}

// Get 50 by 50 items from 1 year max
const LIMIT_INTERVAL = 50
const START_TIME = new Date().setFullYear(new Date().getFullYear() - 1)

export default {
  components: {
    Item,
  },
  data () {
    return {
      search: '',
      searchDelayed: '',
      histories: [],
      focus: 0,
      isInitialLoading: true,
      isLoading: true,
      canLoadMore: true,
      limit: LIMIT_INTERVAL,
      copied: null,
    }
  },
  computed: {
    focusedUrl() {
      return this.histories[this.focus].url
    },
  },
  watch: {
    focus() {
      this.$nextTick(() => {
        this.$refs.nav.querySelector('.has-focus').scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      })
    },
    search: debounce(function debounced() {
      this.canLoadMore = true
      this.limit = LIMIT_INTERVAL
      this.queryHistory().then((histories) => {
        console.log(histories)
        this.focus = 0
        this.searchDelayed = this.search // Update children only after results displayed
        window.scrollTo(0, 0) // Force scroll to top without animation
      })
    }, 200),
    isInitialLoading(isInitialLoading) {
      if (!isInitialLoading) {
        this.observer.observe(this.$refs.intersect)
      }
    }
  },
  mounted() {
    this.queryHistory()
    this.observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !this.isInitialLoading && this.canLoadMore) {
        this.limit += LIMIT_INTERVAL
        this.queryHistory()
      }
    }, { rootMargin: '50% 0px' })
  },
  methods: {
    handleInput() {
      this.isInitialLoading = true
    },
    open(e) {
      // CMD (Mac) || Ctrl (Windows/Linux) -> open in new tab
      if (e.metaKey || e.ctrlKey) {
        browser.tabs.create({ url: this.focusedUrl })
        return
      }
      // Alt -> copy URL
      if (e.altKey) {
        navigator.clipboard.writeText(this.focusedUrl).then(() => {
          this.copied = this.focus
          setTimeout(() => {
            this.copied = null
          }, 1000);
        })
        return
      }
      // Else -> open in current tab
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        browser.tabs.update(tabs[0].id, { url: this.focusedUrl })
      })
    },
    up() {
      this.focus = this.focus === 0 ? this.histories.length - 1 : this.focus - 1
    },
    down() {
      this.focus = this.focus < this.histories.length - 1 ? this.focus + 1 : 0
    },
    queryHistory() {
      this.isLoading = true
      return browser.history.search({ text: this.search, maxResults: this.limit, startTime: START_TIME }).then(histories => {
        if (histories.length === this.histories.length && this.search === this.searchDelayed) {
          this.canLoadMore = false
        }
        this.histories = histories
        this.isInitialLoading = false
        this.isLoading = false
        return histories
      })
    }
  }
}
</script>

<template>
  <form
    class="text-gray-800"
    @keydown.up.prevent.stop="up"
    @keydown.down.prevent.stop="down"
    @keydown.enter.prevent.stop="open"
  >
    <input class="w-full py-2 px-4 border-b border-gray-200 sticky top-0 z-10 focus:outline-none" type="text" autofocus placeholder="Search history..." v-model="search">
    <nav v-if="histories.length" ref="nav">
      <Item
        v-for="(history, index) in histories"
        :key="history.id"
        :search="searchDelayed"
        :history="history"
        :hasFocus="index === focus"
        @focus="focus = index"
        @open="open"
      />
    </nav>
    <div ref="intersect" />
    <div v-if="canLoadMore" class="text-gray-500 py-2 px-4">
      Loading previous items...
    </div>
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

const LIMIT_INTERVAL = 10
const today = new Date()
const startTime = today.setYear(today.getYear() - 1)

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
      this.queryHistory().then(() => {
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
    })
  },
  methods: {
    open(e) {
      if (e.metaKey || e.ctrlKey) {
        chrome.tabs.create({ url: this.focusedUrl })
        return
      }
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.update(tabs[0].id, { url: this.focusedUrl })
      })
    },
    up() {
      this.focus = this.focus === 0 ? this.histories.length - 1 : this.focus - 1
    },
    down() {
      this.focus = this.focus < this.histories.length - 1 ? this.focus + 1 : 0
    },
    queryHistory() {
      this.isInitialLoading = true
      return new Promise((resolve, reject) => {
        chrome.history.search({ text: this.search, maxResults: this.limit, startTime }, histories => {
          if (histories.length === this.histories.length && this.search === this.searchDelayed) {
            this.canLoadMore = false
          }
          this.histories = histories
          this.isInitialLoading = false
          this.isLoading = false
          resolve(histories)
        })
      })
    }
  }
}
</script>

<style src="../assets/tailwind.css">

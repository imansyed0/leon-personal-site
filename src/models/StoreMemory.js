import errors from '../lib/errors'

/**
 * StoreMemory is an in-memory storage implementation that works in
 * serverless environments with read-only filesystems (like Vercel).
 * It stores data in a JavaScript Map that persists for the lifetime of
 * the Lambda function instance.
 */
class StoreMemory {
  constructor() {
    // In-memory storage using a Map
    this.storage = new Map();
  }

  index() {
    // Return all keys in the storage
    return Promise.resolve(Array.from(this.storage.keys()));
  }

  save(url, data) {
    // Store data in memory
    this.storage.set(url, data);
    return Promise.resolve();
  }

  load(url) {
    const parts = url.split('/');
    
    if (this.storage.has(url.split('/').slice(0, 3).join('/'))) {
      const data = this.storage.get(url.split('/').slice(0, 3).join('/'));
      
      if (parts.length === 3) {
        // No lookup if the requested url doesn't have a fragment
        return Promise.resolve(data);
      } else if (parts[2] === 'ids') {
        // Do a lookup if fragment is included to filter a relevant item
        // When the resource requested is 'ids'
        const id = parseInt(parts[3]);
        if (!isNaN(id) && id >= 0 && id < data.length) {
          return Promise.resolve(data[id]);
        } else {
          throw errors.noFragment(parts);
        }
      } else {
        // Do a lookup if fragment is included to filter a relevant item
        const index = parseInt(parts[3]);
        if (!isNaN(index) && index >= 0 && index < data.length) {
          return Promise.resolve(data.filter((vl, idx) => idx === index)[0]);
        } else {
          throw errors.noFragment(parts);
        }
      }
    } else {
      return Promise.reject(errors.noResource(parts));
    }
  }
}

export default StoreMemory 
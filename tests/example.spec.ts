import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { ShoppingItem, Category } from '~/types/app-types'

// Mock component or real component imports
// import ShoppingListItem from '~/components/ShoppingListItem.vue'

// Example of a typed test helper function
function createMockShoppingItem(overrides?: Partial<ShoppingItem>): ShoppingItem {
  return {
    id: 'test-id-1',
    name: 'Test Item',
    quantity: 1,
    checked: false,
    categoryId: 'category-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function createMockCategory(overrides?: Partial<Category>): Category {
  return {
    id: 'category-1',
    name: 'Test Category',
    colorClass: 'bg-blue-500',
    icon: 'shopping-bag',
    order: 1,
    ...overrides,
  }
}

describe('Example TypeScript Test', () => {
  it('demonstrates typed test data', () => {
    // Example of creating typed test data
    const item = createMockShoppingItem({ name: 'Milk', quantity: 2 })
    const category = createMockCategory({ name: 'Dairy' })

    // Type checking works
    expect(item.name).toBe('Milk')
    expect(item.quantity).toBe(2)
    expect(category.name).toBe('Dairy')
  })

  it('shows how to test components with TypeScript', () => {
    // This is a placeholder for actual component tests
    // You would mount your component and test its behavior
    
    /*
    const wrapper = mount(ShoppingListItem, {
      props: {
        item: createMockShoppingItem(),
        category: createMockCategory(),
      },
    })
    
    expect(wrapper.text()).toContain('Test Item')
    */
    
    // Placeholder assertion for this example
    expect(true).toBe(true)
  })
})

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { getCartItems, getItems, removeFromCart } from '../utils/api.js'
import './CartModal.css'

function CartModal({ isOpen, onClose }) {
  const [cartItems, setCartItems] = useState([])
  const [itemsData, setItemsData] = useState({})
  const [loading, setLoading] = useState(true)
  const removingItems = useRef(new Set()) // Track items being removed

  useEffect(() => {
    if (isOpen) {
      fetchCartData()
    }
  }, [isOpen])

  const fetchCartData = async () => {
    try {
      setLoading(true)
      const cartData = await getCartItems()
      const allItems = await getItems()
      
      const itemsMap = {}
      allItems.forEach(item => {
        itemsMap[item._id || item.id] = item
      })
      
      setItemsData(itemsMap)
      setCartItems(Array.isArray(cartData) ? cartData : [])
    } catch (error) {
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId) => {
    // Prevent duplicate clicks
    if (removingItems.current.has(itemId)) {
      return
    }

    removingItems.current.add(itemId)

    const itemName = cartItems.find(ci => ci.itemId === itemId)?.itemName || 'Item'
    
    // Optimistic update - remove from UI immediately
    setCartItems(prev => prev.filter(item => item.itemId !== itemId))
    
    // Show loading toast
    const toastId = toast.loading(`Removing ${itemName}...`)

    try {
      await removeFromCart(itemId)
      // Refresh cart data to ensure consistency
      await fetchCartData()
      toast.success(`${itemName} removed from cart`, { id: toastId })
    } catch (error) {
      // Revert optimistic update on error
      await fetchCartData()
      toast.error(error.message || 'Failed to remove item', { id: toastId })
    } finally {
      setTimeout(() => {
        removingItems.current.delete(itemId)
      }, 500)
    }
  }

  if (!isOpen) return null

  return (
    <div className="cart-modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-modal-header">
          <h2>Shopping Cart</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="cart-modal-body">
          {loading ? (
            <div className="cart-loading">Loading cart...</div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <div className="cart-items-list">
              {cartItems.map((cartItem, index) => {
                const item = itemsData[cartItem.itemId]
                const itemName = cartItem.itemName || item?.name || `Item ${cartItem.itemId}`
                return (
                  <div key={index} className="cart-item-row">
                    <div className="cart-item-info">
                      <p className="cart-item-name">{itemName}</p>
                      <p className="cart-item-id">Item ID: {cartItem.itemId}</p>
                      <p className="cart-item-quantity">Quantity: {cartItem.quantity || 1}</p>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemoveItem(cartItem.itemId)}
                    >
                      <i className="bi bi-trash"></i> Delete
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-modal-footer">
            <p className="cart-count">Total Items: {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal


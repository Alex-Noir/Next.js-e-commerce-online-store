import { useState, useEffect, useContext } from 'react'
import CartContext from '../../context/cartContext'

export default function AddToCart({ id, price, available }) {
  const { refreshCart, evaluateTotalPrice } = useContext(CartContext)

  const [ item, setItem ] = useState(dataItem)
  const [ isInCart, setIsInCart ] = useState(dataItem.isInCart)
  const [ selectedAmount, setSelectedAmount ] = useState(1)
  
  const updTotalPrice = price * selectedAmount

  let options = []
  
  for (let i = 1; i <= available; i++) {
    options.push(<option value={`${i}`}>{i}</option>)
  }

  const chooseAmount = () => {
    setSelectedAmount(parseInt(document.getElementById("items").value))
  }

  const fetcher = () => {
    fetch(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_PROD_HOST
          : process.env.NEXT_PUBLIC_DEV_HOST
      }/api/data?category=object&id=${id}`
    )
      .then(r => {
        if (r.status >= 400) {
          return r.then(errResData => {
            const err = new Error("Error.")
            err.data = errResData
            throw err
          })
        }
        return r.json()
      })
      .then(r => {
        setItem(r.data)
        setIsInCart(r.data.isInCart)
      })
      .catch(err => {
        console.error(err)
      })
  }

  useEffect(() => {
    if (localStorage.getItem('cartList') === null) {
      fetcher()
    } else if (localStorage.getItem('cartList') !== null) {
      const cartList = JSON.parse(localStorage.cartList)
      const cartListItem = cartList.find(cartListItem => cartListItem.id === id)
      if (cartListItem !== undefined) {
        setItem(cartListItem)
        setIsInCart(cartListItem.isInCart)
      } else if (cartListItem === undefined) {
        fetcher()
      }
    }
  }, [])

  const addToCart = (id, selectedAmount, updTotalPrice) => {
    fetch(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_PROD_HOST
          : process.env.NEXT_PUBLIC_DEV_HOST
      }/api/cart/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
          amountInCart: selectedAmount,
          totalPrice: updTotalPrice
        })
      }
    )
      .then(r => {
        if (r.status >= 400) {
          return r.json().then(errResData => {
            const err = new Error("Error.")
            err.data = errResData
            throw err
          })
        }
        return r.json()
      })
      .then(r => {
        const item = r[0]
        const cartList = JSON.parse(localStorage.cartList)
        cartList.push(item)
        localStorage.setItem("cartList", JSON.stringify(cartList))
        refreshCart()
        const cartListItem = cartList.find(
          (cartListItem) => cartListItem.id === id
        )
        setItem(cartListItem)
        setIsInCart(cartListItem.isInCart)

        evaluateTotalPrice()
      })
  }

  const cancelAdding = (id, amountInCart) => {
    fetch(
      `${
        process.env.NODE_ENV === "production"
          ? process.env.NEXT_PUBLIC_PROD_HOST
          : process.env.NEXT_PUBLIC_DEV_HOST
      }/api/cart/${id}?type=cancel`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
          amountInCart: amountInCart
        })
      }
    )
      .then(r => {
        if (r.status >= 400) {
          return r.json().then(errResData => {
            const err = new Error("Error.")
            err.data = errResData
            throw err
          })
        }
        return r.json()
      })
      .then(r => {
        const item = r[0]
        const cartList = JSON.parse(localStorage.cartList)
        const filteredCartList = cartList.filter(
          (cartListItem) => cartListItem.id !== parseInt(item.id)
        )
        localStorage.setItem("cartList", JSON.stringify(filteredCartList))
        refreshCart()
        setItem(item)
        setIsInCart(item.isInCart)
      })
  }

  return (
    <div className="add-to-cart">
      <h3>
        {
          isInCart
          ? <div>
              <h6>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={() => cancelAdding(id, item.amountInCart)}
                >
                  Added (cancel)
                </button>
              </h6>
            </div>
          : <div>
              <label htmlFor="items">
                In stock:&nbsp;
                <select id="items" onChange={() => chooseAmount()}>
                  {options}
                </select>
              </label>
              <h6>
                <button 
                  type="button"
                  className="btn btn-warning" 
                  onClick={() => addToCart(id, selectedAmount, updTotalPrice)}
                >
                  Add to cart
                </button>
              </h6>
            </div>
        }
      </h3>
      {
        isInCart
        ? <div>
            <span>In cart: {item.amountInCart}</span>
          </div>
        : <div className="invisible"></div>
      }
    </div>
  )
}

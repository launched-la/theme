import * as cart from '@shopify/theme-cart'
import * as React from 'react'
import {withI18n, WithI18n} from 'react-i18next'

import addClickListenerForAttr from '../../utils/add-click-listener-for-attr'
import withLoadingUI from '../../utils/with-loading-ui'

class CartApp extends React.Component<WithI18n, Cart> {
  public componentDidMount() {
    this.setState(() => window.cart)
    addClickListenerForAttr('data-add-to-cart-variant-id', this.addToCartWithDom)
    addClickListenerForAttr('data-remove-from-cart-key', this.removeFromCartWithDom)
    window.cartApp = {add: this.addToCart}
  }

  public render() {
    if (!this.state) { return null }

    const {t} = this.props
    const {items} = this.state

    this.renderExternalDOM()

    return <div>
      <div className='grid-x'>
        <div className='cell small-6'>
          <h2 className='h5'>{t('cart.general.title')}</h2>
        </div>
        <div className='cell small-6 text-right'>
          <a href='#' data-close-drawer='cart-drawer'>{t('cart.general.close')}</a>
        </div>
      </div>

      {items.length ? items.map((item) => <div key={item.id}>
        <span>{item.quantity} x {item.title}</span>
        <button className='button' data-remove-from-cart-key={item.key}>{t('cart.general.remove')}</button>
      </div>) : <div>{t('cart.general.empty')}</div>}
    </div>
  }

  private addToCart = async (items: Array<[number, {properties?: object, quantity?: number}?]>): Promise<boolean> => {
    try {
      for (const item of items) {
        // shopify requires synchronous adding
        await cart.addItem(...item)
      }
      await this.getCart()
      window.Drawer.open('cart-drawer')
      return true
    } catch (e) {
      return false
    }
  }

  private addToCartWithDom = async (variantId: string, target: HTMLElement) => {
    withLoadingUI(target, async () => {
      await this.addToCart([[parseInt(variantId, 10)]])
    })
  }

  private getCart = async () => {
    const contents = await cart.getState()
    this.setState(() => contents)
  }

  private removeFromCart = async (key: string): Promise<boolean> => {
    try {
      await cart.removeItem(key)
      await this.getCart()
      return true
    } catch (e) {
      return false
    }
  }

  private removeFromCartWithDom = async (key: string, target: HTMLElement) => {
    withLoadingUI(target, async () => {
      await this.removeFromCart(key)
    })
  }

  private renderExternalDOM = () => {
    const numItems = this.state.items.length
    const innerHTML = numItems > 0 ? `${numItems}` : ''
    const display = numItems > 0 ? 'flex' : 'none'

    const els: NodeListOf<HTMLElement> = document.querySelectorAll('[data-cart-count]')
    els.forEach((el) => {
      el.innerHTML = innerHTML
      el.style.display = display
    })
  }
}

export default withI18n()(CartApp)

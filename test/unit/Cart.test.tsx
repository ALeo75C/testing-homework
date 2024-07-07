import React from 'react';
import { Cart } from '../../src/client/pages/Cart';
import { render, screen } from '@testing-library/react';
import events from '@testing-library/user-event';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import { CartApi, ExampleApi } from '../../src/client/api';
import { initStore } from '../../src/client/store';
import { BrowserRouter, Form, MemoryRouter } from 'react-router-dom';
import { Application } from '../../src/client/Application';

import { FormProps } from '../../src/client/components/Form';
import { CheckoutFormData } from '../../src/common/types';

afterEach(() => {
    localStorage.clear()
})

describe('Корзина', () => {
    it('Корзина корректно отрисовывает название, цену. количество товара и общую стоимость', () => {
        let initialStateValues =
            {
                cart: {1: {
                    name: 'test',
                    price: 200,
                    count: 5,
                }},
                latestOrderId: 1
            }
        const store = createStore((state) => state, initialStateValues)

        const cart = (
            <Provider store={store}>
                <Cart />
            </Provider>
        )
        const {container} = render(cart); 


        const name = container.getElementsByClassName('Cart-Name')[0].textContent
        const price = container.getElementsByClassName('Cart-Price')[0].textContent
        const count = container.getElementsByClassName('Cart-Count')[0].textContent
        const total = container.getElementsByClassName('Cart-Total')[0].textContent
        
        expect(name).toBe('test');
        expect(price).toBe('$200');
        expect(count).toBe('5');
        expect(total).toBe('$1000');
    });
    it('В шапке отображается количество уникальных элементов в корзине', () => {
        const initialStateValues =
            {
                cart: {
                    1: {name: 'test'},
                    2: {name: 'test2'}
                }
            }
        const store = createStore((state) => state, initialStateValues)
        
        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );
        
        render(application);
        
        const header = screen.getByText(/cart/i).textContent
        expect(header).toBe('Cart (2)');
    });
    it('Если корзина пустая отоброжается кнопка с ссылкой на каталог', () => {
        let initialStateValues =
        {
            cart: {}
        }
        const store = createStore((state) => state, initialStateValues)

        const cart = (
            <MemoryRouter initialEntries={['/catalog']}>
                <Provider store={store}>
                    <Cart />
                </Provider>
            </MemoryRouter>
        )
        render(cart)
        const linkHref = screen.getByRole('link').getAttribute('href')
        expect(linkHref).toBe('/catalog')
    });
    it('При нажатии на кнопку очистить корзину, корзина очищается', async () => {
        const api = new ExampleApi('/cart');
        const cart = new CartApi();
        cart.setState({1: {name: 'test', price: 200, count: 5}})
        const store = initStore(api, cart);
        
        const card = (
            <MemoryRouter initialEntries={['/cart']}>
                <Provider store={store}>
                    <Cart />
                </Provider>
            </MemoryRouter>
        );
        render(card);

        const button = screen.getByRole('button', {
            name: /clear shopping cart/i
        })
        
        await events.click(button)

        const linkHref = screen.getByRole('link').getAttribute('href')
        expect(linkHref).toBe('/catalog')
    });
    it('В корзине отображаться таблица с добавленными в нее товарами', async() => {
        const initialStateValues =
            {
                cart: {1: {
                    name: 'test',
                    price: 200,
                    count: '5',
                }, 2: {
                    name: 'test2',
                    price: 100,
                    count: '1',
                }, 3: {
                    name: 'test3',
                    price: 10,
                    count: '5',
                }},
                latestOrderId: 1
            }
        const store = createStore((state) => state, initialStateValues)

        const cart = (
            <Provider store={store}>
                <Cart />
            </Provider>
        )
        const {container, getAllByTestId} = render(cart); 
    
        let total = 0

        Object.entries(initialStateValues.cart).map(([id, item], index) => {
            const row = getAllByTestId(id)
            const name = row[0].querySelectorAll('.Cart-Name')[0].textContent
            const price = row[0].getElementsByClassName('Cart-Price')[0].textContent
            const count = row[0].getElementsByClassName('Cart-Count')[0].textContent
            const totalItem = container.getElementsByClassName('Cart-Total')[0].textContent
            
            total += Number(totalItem?.slice(1, totalItem.length)) * Number(count)
            
            expect(name).toBe(item.name);
            expect(price).toBe('$'+item.price);
            expect(count).toBe(item.count);
        })

        const totalItem = container.getElementsByClassName('Cart-OrderPrice')[0].textContent
        expect(totalItem).toBe(`$1150`);

    });
});
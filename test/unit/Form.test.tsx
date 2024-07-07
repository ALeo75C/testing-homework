import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

// import {describe, it, expect} from '@jest/globals'
import { getByTestId, render, screen, waitFor } from '@testing-library/react';
import event from '@testing-library/user-event';

import { Application } from '../../src/client/Application';
import { ExampleApi, CartApi } from '../../src/client/api';
import { initStore } from '../../src/client/store';
import { Form } from '../../src/client/components/Form';
import { after } from 'node:test';
import { createStore } from 'redux';
import { Cart } from '../../src/client/pages/Cart';
import exp from 'node:constants';

const generateStore = () => {
    const basename = '/hw/store';
    const api = new ExampleApi(basename);
    const cart = new CartApi();
    return initStore(api, cart);
}

afterEach(() => {
    localStorage.clear()
})

describe('Форма', () => {
    it('Форма корректно заполняется', async() => {
        const store = generateStore()
        
        const form = (
            <MemoryRouter initialEntries={['/cart']}>
                <Provider store={initStore(new ExampleApi('/'), new CartApi())}>
                    <Form onSubmit={(data) => {console.log(data)}}/>
                </Provider>
            </MemoryRouter>
        );
        
        const {container, getByLabelText} = render(form);

        await waitFor(async() => {
            const nameField = getByLabelText('Name')
            const phoneField = getByLabelText('Phone')
            const addressField = getByLabelText('Address')
            
            await event.type(nameField, 'test')
            await event.type(phoneField, '+12223334455')
            await event.type(addressField, 'test')
            
            expect(nameField).toHaveProperty('value', 'test');
            expect(phoneField).toHaveProperty('value', '+12223334455');
            expect(addressField).toHaveProperty('value', 'test');
        })
    });
    it('При ошибочной валидации форма не заполняется', async() => {
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
        const {container, getByLabelText} = render(cart);

        const btn = screen.getByRole('button', {
            name: /checkout/i
        })

        
        await waitFor(async() => {
            await event.click(btn)
            const nameField = container.getElementsByClassName('Form-Field_type_name')[0]
            expect(nameField.className).toMatch(/is-invalid/);
        })
    });
    it('При успешном заполнении формы происходит переход на страницу с сообщение об успехе', async() => {
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
        const {container, getByLabelText, getByRole} = render(cart);

        
        await waitFor(async() => {
            const nameField = getByLabelText('Name')
            const phoneField = getByLabelText('Phone')
            const addressField = getByLabelText('Address')
            
            await event.type(nameField, 'test')
            await event.type(phoneField, '+12223334455')
            await event.type(addressField, 'test')
            
            const btn = getByRole('button', {
                name: /checkout/i
            })
            await event.click(btn)

            const alert = container.getElementsByClassName('alert-success')
            expect(alert).toBeTruthy()
        })
    });
    it('В собщении об успехе корректный номер заказа', async() => {
        const initialStateValues =
            {
                cart: {},
                latestOrderId: 1
            }
        const store = createStore((state) => state, initialStateValues)

        const cart = (
            <MemoryRouter initialEntries={['/cart']}>
                <Provider store={store}>
                    <Cart />
                </Provider>
            </MemoryRouter>
        )
        const {container} = render(cart); 
    
        const orderNumber = container.getElementsByClassName('Cart-Number')[0].textContent
        expect(orderNumber).toBe('1')

    });
});


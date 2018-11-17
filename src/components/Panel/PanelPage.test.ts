import {shallow} from 'enzyme'
import React from 'react'
import PanelPage from './PanelPage'

test('renders without failing', () => {
    let wrapper = shallow(<PanelPage / >)

    expect(wrapper).toBeDefined()
})

test('able to change theme based on context', () => {
    let wrapper = shallow(<PanelPage / >)
    let instance = wrapper.instance()

    expect(wrapper.state('theme')).toEqual('light')
    instance.contextUpdate({theme: 'dark'}, ['theme'])
    expect(wrapper.state('theme')).toEqual('dark')
})

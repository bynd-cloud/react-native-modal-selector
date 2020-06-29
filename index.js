'use strict';

import React from 'react';
import PropTypes from 'prop-types';

import {
    View,
    Modal,
    Text,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    ViewPropTypes as RNViewPropTypes,
    KeyboardAvoidingView,
    Keyboard,
    Platform
} from 'react-native';

import styles from './style';
import { RFValue } from 'react-native-responsive-fontsize';
import { t } from '../../src/Lang/i18n';
import { TextInput } from '../../src/UI';

const ViewPropTypes = RNViewPropTypes || View.propTypes;

let componentIndex = 0;

const propTypes = {
    data: PropTypes.array,
    onChange: PropTypes.func,
    onModalOpen: PropTypes.func,
    onModalClose: PropTypes.func,
    keyExtractor: PropTypes.func,
    labelExtractor: PropTypes.func,
    visible: PropTypes.bool,
    closeOnChange: PropTypes.bool,
    initValue: PropTypes.string,
    animationType: PropTypes.oneOf(['none', 'slide', 'fade']),
    style: ViewPropTypes.style,
    selectStyle: ViewPropTypes.style,
    selectTextStyle: Text.propTypes.style,
    optionStyle: ViewPropTypes.style,
    optionTextStyle: Text.propTypes.style,
    optionContainerStyle: ViewPropTypes.style,
    sectionStyle: ViewPropTypes.style,
    childrenContainerStyle: ViewPropTypes.style,
    touchableStyle: ViewPropTypes.style,
    touchableActiveOpacity: PropTypes.number,
    sectionTextStyle: Text.propTypes.style,
    selectedItemTextStyle: Text.propTypes.style,
    cancelContainerStyle: ViewPropTypes.style,
    cancelStyle: ViewPropTypes.style,
    cancelTextStyle: Text.propTypes.style,
    overlayStyle: ViewPropTypes.style,
    initValueTextStyle: Text.propTypes.style,
    cancelText: PropTypes.string,
    disabled: PropTypes.bool,
    supportedOrientations: PropTypes.arrayOf(
        PropTypes.oneOf([
            'portrait',
            'portrait-upside-down',
            'landscape',
            'landscape-left',
            'landscape-right',
        ]),
    ),
    keyboardShouldPersistTaps: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    backdropPressToClose: PropTypes.bool,
    openButtonContainerAccessible: PropTypes.bool,
    listItemAccessible: PropTypes.bool,
    cancelButtonAccessible: PropTypes.bool,
    scrollViewAccessible: PropTypes.bool,
    scrollViewAccessibilityLabel: PropTypes.string,
    cancelButtonAccessibilityLabel: PropTypes.string,
    passThruProps: PropTypes.object,
    selectTextPassThruProps: PropTypes.object,
    optionTextPassThruProps: PropTypes.object,
    scrollViewPassThruProps: PropTypes.object,
    modalOpenerHitSlop: PropTypes.object,
    customSelector: PropTypes.node,
    selectedKey: PropTypes.any,
    enableShortPress: PropTypes.bool,
    enableLongPress: PropTypes.bool,
};

const defaultProps = {
    data: [],
    onChange: () => { },
    onModalOpen: () => { },
    onModalClose: () => { },
    keyExtractor: (item) => item.key,
    labelExtractor: (item) => item.label,
    componentExtractor: (item) => item.component,
    visible: false,
    closeOnChange: true,
    initValue: 'Select me!',
    animationType: 'slide',
    style: {},
    selectStyle: {},
    selectTextStyle: {},
    optionStyle: {},
    optionTextStyle: {},
    optionContainerStyle: {},
    sectionStyle: {},
    childrenContainerStyle: {},
    touchableStyle: {},
    touchableActiveOpacity: 0.2,
    sectionTextStyle: {},
    selectedItemTextStyle: {},
    cancelContainerStyle: {},
    cancelStyle: {},
    cancelTextStyle: {},
    overlayStyle: {},
    initValueTextStyle: {},
    cancelText: 'cancel',
    disabled: false,
    supportedOrientations: ['portrait', 'landscape'],
    keyboardShouldPersistTaps: 'always',
    backdropPressToClose: false,
    openButtonContainerAccessible: false,
    listItemAccessible: false,
    cancelButtonAccessible: false,
    scrollViewAccessible: false,
    scrollViewAccessibilityLabel: "",
    cancelButtonAccessibilityLabel: "",
    passThruProps: {},
    selectTextPassThruProps: {},
    optionTextPassThruProps: {},
    scrollViewPassThruProps: {},
    modalOpenerHitSlop: { top: 0, bottom: 0, left: 0, right: 0 },
    customSelector: undefined,
    selectedKey: '',
    enableShortPress: true,
    enableLongPress: false,
};

export default class ModalSelector extends React.Component {

    constructor(props) {
        super(props);
        let selectedItem = this.validateSelectedKey(props.selectedKey);
        this.state = {
            modalVisible: props.visible,
            selected: selectedItem.label,
            cancelText: props.cancelText,
            changedItem: selectedItem.key,
            searchText: "",
            data: this.props.data
        };
    }

    componentDidUpdate(prevProps, prevState) {
        let newState = {};
        let doUpdate = false;
        if (prevProps.initValue !== this.props.initValue) {
            newState.selected = this.props.initValue;
            doUpdate = true;
        }
        if (prevProps.visible !== this.props.visible) {
            newState.modalVisible = this.props.visible;
            doUpdate = true;
        }
        if (prevProps.selectedKey !== this.props.selectedKey || prevProps.data !== this.props.data) {
            let selectedItem = this.validateSelectedKey(this.props.selectedKey);
            newState.selected = selectedItem.label;
            newState.changedItem = selectedItem.key;
            doUpdate = true;
        }
        if (doUpdate) {
            this.setState(newState);
        }
    }

    validateSelectedKey = (key) => {
        let selectedItem = this.props.data.filter((item) => this.props.keyExtractor(item) === key);
        let selectedLabel = selectedItem.length > 0 ? this.props.labelExtractor(selectedItem[0]) : this.props.initValue;
        let selectedKey = selectedItem.length > 0 ? key : undefined;
        return { label: selectedLabel, key: selectedKey }
    }

    onChange = (item) => {
        this.props.onChange(item);
        this.setState({ selected: this.props.labelExtractor(item), changedItem: item }, () => {
            if (this.props.closeOnChange)
                this.close(item);
        });
    }

    getSelectedItem() {
        return this.state.changedItem;
    }

    close = (item) => {
        this.props.onModalClose(item);
        this.setState({ searchText: "", data: this.props.data })
        this.setState({
            modalVisible: false,
        });
    }

    open = (params = {}) => {
        if (!params.longPress && !this.props.enableShortPress) {
            return;
        }
        if (params.longPress && !this.props.enableLongPress) {
            return;
        }
        this.props.onModalOpen(params);
        this.setState({
            modalVisible: true,
            changedItem: undefined,
        });
    }

    renderSection = (section) => {
        const optionComponent = this.props.componentExtractor(section);
        let component = optionComponent || (
            <Text style={[styles.sectionTextStyle, this.props.sectionTextStyle]}>{this.props.labelExtractor(section)}</Text>
        );

        return (
            <View key={this.props.keyExtractor(section)} style={[styles.sectionStyle, this.props.sectionStyle]}>
                {component}
            </View>
        );
    }

    renderOption = (option, isLastItem, isFirstItem) => {
        const optionComponent = this.props.componentExtractor(option);
        const optionLabel = this.props.labelExtractor(option);
        const isSelectedItem = optionLabel === this.state.selected;

        let component = optionComponent || (
            <Text style={[styles.optionTextStyle, this.props.optionTextStyle, isSelectedItem && this.props.selectedItemTextStyle]} {...this.props.optionTextPassThruProps}>
                {optionLabel}
            </Text>
        );

        return (
            <TouchableOpacity
                key={this.props.keyExtractor(option)}
                onPress={() => this.onChange(option)}
                activeOpacity={this.props.touchableActiveOpacity}
                accessible={this.props.listItemAccessible}
                accessibilityLabel={option.accessibilityLabel || undefined}
                importantForAccessibility={isFirstItem ? 'yes' : 'no'}
                {...this.props.passThruProps}
            >
                <View style={[styles.optionStyle, this.props.optionStyle, isLastItem && { borderBottomWidth: 0 }]}>
                    {component}
                </View>
            </TouchableOpacity>);
    }

    onChangeText = text => {
        console.log(text)
        let temp = this.props.data.filter(item => item.name.toLowerCase().includes(text.toLowerCase()))
        console.log(temp)
        this.setState({ data: temp, searchText: text })
    }

    renderOptionList = () => {
        const {
            data,
            backdropPressToClose,
            scrollViewPassThruProps,
            overlayStyle,
            optionContainerStyle,
            keyboardShouldPersistTaps,
            scrollViewAccessible,
            scrollViewAccessibilityLabel,
            cancelContainerStyle,
            touchableActiveOpacity,
            cancelButtonAccessible,
            cancelButtonAccessibilityLabel,
            cancelStyle,
            cancelTextStyle,
            cancelText,
        } = this.props;

        let options = this.state.data.map((item, index) => {
            if (item.section) {
                return this.renderSection(item);
            }
            return this.renderOption(item, index === data.length - 1, index === 0);
        });

        let Overlay = View;
        let overlayProps = {
            style: { flex: 1 }
        };
        // Some RN versions have a bug here, so making the property opt-in works around this problem
        if (backdropPressToClose) {
            Overlay = TouchableWithoutFeedback;
            overlayProps = {
                key: `modalSelector${componentIndex++}`,
                accessible: false,
                onPress: this.close
            };
        }

        const optionsContainerStyle = { paddingHorizontal: 10 };
        if (scrollViewPassThruProps && scrollViewPassThruProps.horizontal) {
            optionsContainerStyle.flexDirection = 'row';
        }

        return (
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={[styles.overlayStyle, overlayStyle]}>
                    <View style={[styles.optionContainer, optionContainerStyle]}>
                        <View style={{ height: RFValue(40), width: '100%', }}>
                            <TextInput value={this.state.searchText} onChangeText={this.onChangeText} type="normal" placeholder={t('PhoneNumber.search')} containerStyle={{ height: '100%', paddingLeft: 10 }} />
                        </View>
                        <ScrollView
                            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
                            accessible={scrollViewAccessible}
                            accessibilityLabel={scrollViewAccessibilityLabel}
                            {...scrollViewPassThruProps}
                        >
                            <View style={optionsContainerStyle}>
                                {options}
                            </View>
                        </ScrollView>
                    </View>
                    <View style={[styles.cancelContainer, cancelContainerStyle]}>
                        <TouchableOpacity onPress={this.close} activeOpacity={touchableActiveOpacity} accessible={cancelButtonAccessible} accessibilityLabel={cancelButtonAccessibilityLabel}>
                            <View style={[styles.cancelStyle, cancelStyle]}>
                                <Text style={[styles.cancelTextStyle, cancelTextStyle]}>{cancelText}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    renderChildren = () => {

        if (this.props.children) {
            return this.props.children;
        }
        let initSelectStyle = this.props.initValue === this.state.selected ?
            [styles.initValueTextStyle, this.props.initValueTextStyle] : [styles.selectTextStyle, this.props.selectTextStyle];
        return (
            <View style={[styles.selectStyle, this.props.selectStyle]}>
                <Text style={initSelectStyle} {...this.props.selectTextPassThruProps}>{this.state.selected}</Text>
            </View>
        );
    }

    render() {

        const dp = (
            <Modal
                transparent={true}
                ref={element => this.model = element}
                supportedOrientations={this.props.supportedOrientations}
                visible={this.state.modalVisible}
                onRequestClose={this.close}
                animationType={this.props.animationType}
                onDismiss={() => this.state.changedItem && this.props.onChange(this.state.changedItem)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? "padding" : "height"} style={{ flex: 1 }}>
                    {this.renderOptionList()}
                </KeyboardAvoidingView>
            </Modal>
        );

        return (
            <View style={this.props.style} {...this.props.passThruProps}>
                {dp}
                {this.props.customSelector ?
                    this.props.customSelector
                    :
                    <TouchableOpacity
                        hitSlop={this.props.modalOpenerHitSlop}
                        activeOpacity={this.props.touchableActiveOpacity}
                        style={this.props.touchableStyle}
                        onPress={this.open}
                        onLongPress={() => this.open({ longPress: true })}
                        disabled={this.props.disabled}
                        accessible={this.props.openButtonContainerAccessible}
                    >
                        <View style={this.props.childrenContainerStyle} pointerEvents="none">
                            {this.renderChildren()}
                        </View>
                    </TouchableOpacity>
                }
            </View>
        );
    }
}

ModalSelector.propTypes = propTypes;
ModalSelector.defaultProps = defaultProps;

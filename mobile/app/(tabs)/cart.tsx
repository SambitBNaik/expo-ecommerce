import { View, Text } from "react-native";
import React from "react";
import useCart from "@/hooks/useCart";
import { useApi } from "@/lib/api";

const CartScreen = () => {
  const api = useApi();
  const {
    cart,
    cartItemCount,
    cartTotal,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
  } = useCart();
  return (
    <View>
      <Text> CartScreen</Text>
    </View>
  );
};

export default CartScreen;

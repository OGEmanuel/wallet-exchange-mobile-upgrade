import React from "react"
import { View, Text, TextInput } from "react-native"
import { useSwap } from "../useSwap"

// Debug component to test the debounced rate fetching
export const DebugSwapForm = () => {
  const {
    baseAmount,
    targetAmount,
    baseCurrency,
    targetCurrency,
    marketRate,
    isRateLoading,
    handleBaseAmountChange,
    handleTargetAmountChange,
    setBaseCurrency,
    setTargetCurrency,
  } = useSwap()

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}>Debug Swap Form</Text>

      <View style={{ marginBottom: 10 }}>
        <Text>Base Amount: {baseAmount}</Text>
        <TextInput
          placeholder="Enter base amount"
          value={baseAmount?.toString() || ""}
          onChangeText={handleBaseAmountChange}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginTop: 5 }}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text>Target Amount: {targetAmount}</Text>
        <TextInput
          placeholder="Enter target amount"
          value={targetAmount?.toString() || ""}
          onChangeText={handleTargetAmountChange}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, marginTop: 5 }}
        />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text>Base Currency: {baseCurrency?.id || "None"}</Text>
        <Text>Target Currency: {targetCurrency?.id || "None"}</Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text>Loading: {isRateLoading ? "Yes" : "No"}</Text>
      </View>

      <View style={{ marginBottom: 10 }}>
        <Text>Market Rate: {JSON.stringify(marketRate, null, 2)}</Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: "bold" }}>Test Buttons:</Text>
        <Text
          onPress={() =>
            setBaseCurrency({ id: "USD", name: "US Dollar", symbol: "USD", code: "USD" })
          }
          style={{ color: "blue", marginTop: 5 }}
        >
          Set Base Currency to USD
        </Text>
        <Text
          onPress={() =>
            setTargetCurrency({ id: "NGN", name: "Nigerian Naira", symbol: "NGN", code: "NGN" })
          }
          style={{ color: "blue", marginTop: 5 }}
        >
          Set Target Currency to NGN
        </Text>
      </View>
    </View>
  )
}

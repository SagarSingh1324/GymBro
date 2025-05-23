import Measurements from "@/components/Measurements";
import WeightLog from "@/components/WeightLog";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Measure() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WeightLog/>
      <Measurements/>
    </SafeAreaView>
  );
}


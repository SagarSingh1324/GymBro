import Measurements from "@/components/Measurements";
import WeightLog from "@/components/WeightLog";
import { useTheme } from "@/theme/ThemeContext";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Measure() {
  const { theme } = useTheme();

  return (
    <SafeAreaView 
      style={{ 
        flex: 1,
        backgroundColor: theme.background
      }}
    >
      <WeightLog/>
      <Measurements/>
    </SafeAreaView>
  );
}
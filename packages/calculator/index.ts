
import { clipboard } from 'electron';
import { create, all } from "mathjs";

const config = {
  epsilon: 1e-12,
  matrix: 'Matrix',
  number: 'number',
  precision: 64,
  predictable: false,
}

const DECIMAL_SEPARATOR = '.'
const ARG_SEPARATOR = ','
const PRECISION = 16

const mathjs = create(all, config)

export class Calculator {
    public static isValidInput(input: string): boolean {
        const blackListInputs = ["version", "i"];

        if (input.length === 0) {
            return false;
        }

        if (blackListInputs.find((b) => input === b) !== undefined) {
            return false;
        }

        let result;
        try {
            // Mathjs throws an error when input cannot be evaluated
            result = mathjs.evaluate?.(this.normalizeInput(input));
        } catch (e) {
            return false;
        }

        if (result === undefined) {
            return false;
        }

        return !isNaN(result)
            || false;
    }

    private static normalizeInput(input: string) {
        return input.replace(
            new RegExp(`\\${DECIMAL_SEPARATOR}|\\${ARG_SEPARATOR}`, 'g'),
            (match) => match === DECIMAL_SEPARATOR ? '.': ',');
    }

    public static calculate(input: string): string {
        let precision = Number(PRECISION);
        if (precision > 64 || precision < 0) {
            precision = 16;
        }
        mathjs.config?.({ number: "BigNumber", precision });
        const result: string = mathjs.evaluate?.(this.normalizeInput(input)).toString();
        return result.replace(
            new RegExp(',|\\.', 'g'),
            (match) => match === '.' ? DECIMAL_SEPARATOR : ARG_SEPARATOR);
    }
}

const COMMAND = 'calculator'

class CalculatorPlugin implements PublicPlugin {

  icon = 'https://img.icons8.com/plasticine/100/000000/apple-calculator.png'
  title = '计算器'
  subtitle = '快捷计算表达式'

  onInput(
    keyword: string,
    setResult: SetResult
  ) {
    if (Calculator.isValidInput(keyword)) {
      const result = Calculator.calculate(keyword)
      setResult([
        {
          title: `= ${result}`,
          subtitle: '点击复制到剪切板',
          icon: 'https://img.icons8.com/plasticine/100/000000/apple-calculator.png',
          text: `${result}`,
          key: 'plugin:calculator',
          onEnter: (item, index, list) => {
            clipboard.writeText(String(item.text))
          }
        }
      ])
    } else {
      setResult([])
    }
  }
}

export default () => new CalculatorPlugin()
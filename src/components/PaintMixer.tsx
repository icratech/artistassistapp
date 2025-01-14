/**
 * Copyright 2023 Eugene Khyst
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  LineChartOutlined,
  MinusOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  ColorPicker,
  Flex,
  Form,
  Row,
  Select,
  SelectProps,
  Space,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import {Color} from 'antd/es/color-picker';
import {useEffect, useState} from 'react';
import {
  OFF_WHITE_HEX,
  Paint,
  PaintBrand,
  PaintMix,
  PaintSet,
  comparePaintMixesByConsistency,
  isThickConsistency,
  mixPaints,
} from '../services/color';
import {gcd} from '../services/math';
import {range} from '../utils';
import {PaintCascader} from './color/PaintCascader';
import {PaintMixDescription} from './color/PaintMixDescription';
import {ReflectanceChartDrawer} from './drawer/ReflectanceChartDrawer';

const FRACTION_OPTIONS: SelectProps['options'] = range(1, 9).map((fraction: number) => ({
  value: fraction,
  label: fraction,
}));

type PaintMixerForm = {
  colors: {
    color: [PaintBrand, number];
    fraction: number;
  }[];
};

const defaultValue = {
  fraction: 1,
};

const formInitialValues = {
  colors: [
    {
      ...defaultValue,
    },
  ],
};

type Props = {
  paintSet?: PaintSet;
};

export const PaintMixer: React.FC<Props> = ({paintSet}: Props) => {
  const {
    token: {colorTextTertiary},
  } = theme.useToken();

  const [form] = Form.useForm<any>();

  const [backgroundColor, setBackgroundColor] = useState<string>(OFF_WHITE_HEX);
  const [paints, setPaints] = useState<Paint[]>([]);
  const [fractions, setFractions] = useState<number[]>([]);
  const [paintMixes, setPaintMixes] = useState<PaintMix[]>([]);
  const [isOpenReflectanceChart, setIsOpenReflectanceChart] = useState<boolean>(false);

  useEffect(() => {
    if (paintSet) {
      form.setFieldsValue(formInitialValues);
      setPaints([]);
      setFractions([]);
    }
  }, [paintSet, form]);

  useEffect(() => {
    setPaintMixes(
      paints.length > 0 && paints.length === fractions.length
        ? mixPaints(paints, fractions, backgroundColor).sort(comparePaintMixesByConsistency)
        : []
    );
  }, [paints, fractions, backgroundColor]);

  const handleFormValuesChange = async (_: Partial<PaintMixerForm>, {colors}: PaintMixerForm) => {
    if (!paintSet || !colors.length) {
      return;
    }
    const paints: Paint[] = [];
    let fractions: number[] = [];
    colors.forEach(({color, fraction}) => {
      if (!color || !fraction) {
        return;
      }
      const [paintBrand, paintId] = color;
      const paint: Paint | undefined = paintSet.colors.find(
        ({brand, id}: Paint) => brand === paintBrand && id === paintId
      );
      if (!paint) {
        return;
      }
      paints.push(paint);
      fractions.push(fraction);
    });
    setPaints(paints);
    if (fractions.length >= 2) {
      const [fraction1, fraction2, ...restFractions] = fractions;
      const divisor = gcd(fraction1, fraction2, ...restFractions);
      fractions = fractions.map((fraction: number): number => fraction / divisor);
    }
    setFractions(fractions);
  };

  if (!paintSet) {
    return <></>;
  }

  const {colors} = paintSet;

  return (
    <>
      <div style={{padding: '0 16px'}}>
        <Typography.Title level={3} style={{marginTop: 0}}>
          Mix colors
        </Typography.Title>
        <Row gutter={[32, 16]} justify="start" style={{marginBottom: 16}}>
          <Col xs={24} md={12} lg={8}>
            <Form
              name="paintMix"
              form={form}
              initialValues={formInitialValues}
              onValuesChange={handleFormValuesChange}
              requiredMark={false}
              autoComplete="off"
            >
              <Form.Item
                label="Background"
                tooltip="The color of paper or canvas, or the color of the base layer when glazed."
                style={{marginBottom: 0}}
              >
                <ColorPicker
                  value={backgroundColor}
                  presets={[
                    {
                      label: 'Recommended',
                      colors: [OFF_WHITE_HEX],
                    },
                  ]}
                  onChangeComplete={(color: Color) => {
                    setBackgroundColor(color.toHexString(true));
                  }}
                  showText
                  disabledAlpha
                />
              </Form.Item>
              <Form.Item style={{marginBottom: 0}}>
                <Flex gap="small" align="center">
                  <Typography.Text style={{display: 'inline-block', width: 50}}>
                    Ratio
                  </Typography.Text>
                  <Typography.Text>×</Typography.Text>
                  <Typography.Text>Color</Typography.Text>
                  <Tooltip title="Select any number of colors to mix and specify the fraction of each color in the resulting mix.">
                    <QuestionCircleOutlined style={{color: colorTextTertiary, cursor: 'help'}} />
                  </Tooltip>
                </Flex>
              </Form.Item>
              <Form.List name="colors">
                {(fields, {add, remove}) => (
                  <>
                    {fields.map(({key, name, ...restField}) => (
                      <Flex key={key} gap="small" align="center" style={{marginBottom: 8}}>
                        <Form.Item
                          {...restField}
                          name={[name, 'fraction']}
                          style={{marginBottom: 0}}
                        >
                          <Select
                            options={FRACTION_OPTIONS}
                            placeholder="Select fraction"
                            style={{width: 50}}
                          />
                        </Form.Item>
                        {'×'}
                        <Form.Item
                          {...restField}
                          name={[name, 'color']}
                          style={{flexGrow: 1, marginBottom: 0}}
                        >
                          <PaintCascader paints={colors} />
                        </Form.Item>
                        {fields.length > 1 && (
                          <Button
                            shape="circle"
                            icon={<MinusOutlined />}
                            onClick={() => remove(name)}
                          />
                        )}
                      </Flex>
                    ))}
                    <Form.Item style={{margin: '16px 0 0'}}>
                      <Space>
                        <Button
                          type="primary"
                          icon={<PlusOutlined />}
                          disabled={fields.length >= 4}
                          onClick={() => add(defaultValue)}
                        >
                          Add color
                        </Button>
                        <Button
                          icon={<LineChartOutlined />}
                          disabled={!paintMixes.some(isThickConsistency)}
                          onClick={() => setIsOpenReflectanceChart(true)}
                        >
                          Reflectance chart
                        </Button>
                      </Space>
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Form>
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Space direction="vertical" size="small" style={{width: '100%'}}>
              {paintMixes.map((paintMix: PaintMix) => (
                <PaintMixDescription
                  key={paintMix.id}
                  paintMix={paintMix}
                  showPaints={isThickConsistency(paintMix)}
                  showConsistency={!isThickConsistency(paintMix)}
                />
              ))}
            </Space>
          </Col>
        </Row>
      </div>
      <ReflectanceChartDrawer
        paintMix={paintMixes.find(isThickConsistency)}
        open={isOpenReflectanceChart}
        onClose={() => setIsOpenReflectanceChart(false)}
      />
    </>
  );
};

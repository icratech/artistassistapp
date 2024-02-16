/**
 * Copyright 2023 Eugene Khyst
 * SPDX-License-Identifier: Apache-2.0
 */

import {Cascader, Space, Typography} from 'antd';
import {CSSProperties} from 'react';
import {PAINT_BRANDS, Paint, PaintBrand, formatPaintLabel} from '../../services/color';
import {computeIfAbsentInMap} from '../../utils';
import {CascaderOption} from '../types';
import {filterCascaderOptions} from '../utils';
import {ColorSquare} from './ColorSquare';

const displayRender = (labels: string[]) => labels[labels.length - 1];

function getPaintOptions(paints?: Paint[]): CascaderOption[] {
  if (!paints?.length) {
    return [];
  }
  const paintsMap = new Map();
  paints.forEach((paint: Paint) =>
    computeIfAbsentInMap(paintsMap, paint.brand, () => []).push(paint)
  );
  return [...paintsMap.entries()].map(([brand, paints]: [PaintBrand, Paint[]]) => {
    const {type} = paints[0];
    const {fullName} = PAINT_BRANDS.get(type)?.get(brand) ?? {};
    return {
      value: brand,
      label: fullName,
      children: [...paints.values()].map((paint: Paint) => {
        const label: string = formatPaintLabel(paint);
        return {
          value: paint.id,
          label: (
            <Space size="small" align="center" key={label}>
              <ColorSquare color={paint.rgb} />
              <Typography.Text>{label}</Typography.Text>
            </Space>
          ),
        };
      }),
    };
  });
}

type SingleValueType = (string | number)[];
type ValueType = SingleValueType | SingleValueType[];

type Props = {
  value?: ValueType;
  onChange?: (value: ValueType) => void;
  paints?: Paint[];
  multiple?: boolean;
  style?: CSSProperties;
};

export const PaintCascader: React.FC<Props> = ({
  value,
  onChange,
  paints,
  multiple,
  style,
}: Props) => {
  const options = getPaintOptions(paints);
  return (
    <Cascader
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select color"
      showSearch={{filter: filterCascaderOptions}}
      expandTrigger="hover"
      displayRender={displayRender}
      allowClear={!!multiple}
      multiple={multiple}
      style={style}
    />
  );
};

/**
 * Copyright 2023 Eugene Khyst
 * SPDX-License-Identifier: Apache-2.0
 */

import {DatabaseOutlined, MinusOutlined} from '@ant-design/icons';
import {Button, Col, Form, Popconfirm, Row, Select, Space} from 'antd';
import {DefaultOptionType as SelectOptionType} from 'antd/es/select';
import {useState} from 'react';
import {
  PaintMix,
  PaintType,
  comparePaintMixesByDataIndex,
  comparePaintMixesByName,
} from '../services/color';
import {RgbTuple} from '../services/color/model';
import {PalettePaintMixCard} from './color/PalettePaintMixCard';

enum Sort {
  ByDataIndex = 1,
  ByName = 2,
}

const PAINT_MIXES_COMPARATORS = {
  [Sort.ByDataIndex]: comparePaintMixesByDataIndex,
  [Sort.ByName]: comparePaintMixesByName,
};

const SORT_OPTIONS: SelectOptionType[] = [
  {value: Sort.ByDataIndex, label: 'Chronologically'},
  {value: Sort.ByName, label: 'Alphabetically'},
];

type Props = {
  paintType: PaintType;
  paintMixes?: PaintMix[];
  savePaintMix: (paintMix: PaintMix) => void;
  deletePaintMix: (paintMixId: string) => void;
  deleteAllPaintMixes: (paintType: PaintType) => void;
  showShareModal: (paintMix: PaintMix) => void;
  setAsBackground: (background: string | RgbTuple) => void;
  showColorSwatch: (paintMixes: PaintMix[]) => void;
  showReflectanceChart: (paintMix: PaintMix) => void;
};

export const PaletteGrid: React.FC<Props> = ({
  paintType,
  paintMixes,
  savePaintMix,
  deletePaintMix,
  deleteAllPaintMixes,
  showShareModal,
  setAsBackground,
  showColorSwatch,
  showReflectanceChart,
}: Props) => {
  const [sort, setSort] = useState<Sort>(Sort.ByDataIndex);

  const handleDelteAllButtonClick = () => {
    deleteAllPaintMixes(paintType);
  };

  return !paintMixes ? null : (
    <>
      <Row>
        <Space align="baseline" wrap style={{marginBottom: 8}}>
          <Button
            type="primary"
            icon={<DatabaseOutlined />}
            onClick={() =>
              paintMixes && showColorSwatch(paintMixes.slice().sort(PAINT_MIXES_COMPARATORS[sort]))
            }
            disabled={!paintMixes}
          >
            Color swatch
          </Button>
          <Popconfirm
            title="Remove all paint mixes"
            description="Are you sure to remove all paint mixes?"
            onConfirm={handleDelteAllButtonClick}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<MinusOutlined />}>Remove all</Button>
          </Popconfirm>
          <Form.Item label="Sort" style={{marginBottom: 0}}>
            <Select
              value={sort}
              onChange={(value: Sort) => setSort(value)}
              options={SORT_OPTIONS}
              style={{width: 140}}
            />
          </Form.Item>
        </Space>
      </Row>
      <Row gutter={[16, 16]} justify="start">
        {paintMixes
          .slice()
          .sort(PAINT_MIXES_COMPARATORS[sort])
          .map((paintMix: PaintMix) => (
            <Col key={paintMix.id} xs={24} md={12} lg={8}>
              <PalettePaintMixCard
                {...{
                  paintMix,
                  showShareModal,
                  setAsBackground,
                  showReflectanceChart,
                  savePaintMix,
                  deletePaintMix,
                }}
              />
            </Col>
          ))}
      </Row>
    </>
  );
};

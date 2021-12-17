import { DEFAULT_LOCALE } from 'i18n';
import { isMinSize } from 'utils/responsive';

const getXTime = dateString => new Date(`${dateString}`).getTime();

const getDataForDate = (dateKey, positions, positionID, positionIDYOffset) => {
  let y = 0;
  if (positionIDYOffset && positions[dateKey].positions[positionIDYOffset]) {
    y += positions[dateKey].positions[positionIDYOffset].length;
  }
  return {
    sdate: dateKey,
    scount: positions[dateKey].positions[positionID]
      ? positions[dateKey].positions[positionID].length
      : 0,
    x: getXTime(dateKey),
    y: parseFloat(
      positions[dateKey].positions[positionID]
        ? y + positions[dateKey].positions[positionID].length
        : y,
    ),
  };
};

const addStep = (previous, datum) => {
  if (previous.length > 0) {
    return [
      {
        ...datum,
        y: previous[previous.length - 1].y,
      },
      datum,
    ];
  }
  return [datum];
};

const dateBuffer = (nDays = 30) => 24 * 60 * 60 * nDays;
export const getXMax = (nDays = 10) => new Date().getTime() + dateBuffer(nDays);

export const prepChartData = (positions, minDate) => {
  const data = Object.keys(positions).reduce(
    (memo, dateKey) => ({
      3: [
        ...memo[3],
        ...addStep(memo[3], getDataForDate(dateKey, positions, 3)),
      ],
      2: [
        ...memo[2],
        ...addStep(memo[2], getDataForDate(dateKey, positions, 2, 3)),
      ],
      1: [
        ...memo[1],
        ...addStep(memo[1], getDataForDate(dateKey, positions, 1, 2)),
      ],
    }),
    {
      3: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
      2: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
      1: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
    },
  );
  return {
    3: [
      ...data[3],
      {
        sdate: 'today',
        scount: 0,
        y: data[3][data[3].length - 1].y,
        x: getXMax(),
      },
    ],
    2: [
      ...data[2],
      {
        sdate: 'today',
        scount: 0,
        y: data[2][data[2].length - 1].y,
        x: getXMax(),
      },
    ],
    1: [
      ...data[1],
      {
        sdate: 'today',
        scount: 0,
        y: data[1][data[1].length - 1].y,
        x: getXMax(),
      },
    ],
  };
};

// TODO: figure out a way to express in pixels rather than scaled values
const X_THRESHOLD = 1600000000;
const Y_OFFSET = 9;
const Y_OFFSET_MIN = 9;

export const prepChartDataSources = (positions, dataStyles) => {
  const data = Object.keys(positions).reduce((memo, dateKey) => {
    const positionsForDate = positions[dateKey];
    const sourcesForDate = positionsForDate.sources;
    if (sourcesForDate) {
      return Object.keys(sourcesForDate).reduce((m2, key) => {
        const source = sourcesForDate[key];
        let y = Y_OFFSET_MIN * -1;
        const x = getXTime(source.date);
        const prev = m2.length > 0 ? m2[m2.length - 1] : null;
        if (prev && x - prev.x < X_THRESHOLD) {
          y = prev.y - Y_OFFSET;
        }
        return [
          ...m2,
          {
            sdate: source.date,
            sposition: source.position_id,
            sid: source.id,
            y,
            x,
            color:
              dataStyles && dataStyles[source.position_id]
                ? dataStyles[source.position_id].style.fillColor
                : 'red',
          },
        ];
      }, memo);
    }
    return memo;
  }, []);
  return data;
};

export const prepChartKey = (positionsCurrentDate, config, locale) => {
  const { key, featureStyle } = config;
  return key.values.reduce((memo, val) => {
    if (val === '0') return memo;
    let t;
    if (key.title && key.title[val]) {
      t =
        key.title[val][locale] ||
        key.title[val][DEFAULT_LOCALE] ||
        key.title[val];
    }
    let style;
    if (featureStyle && featureStyle.style) {
      style = Object.keys(featureStyle.style).reduce(
        (memo2, attr) => ({
          ...memo2,
          [attr]: featureStyle.style[attr][val],
        }),
        {
          fillOpacity: 0.4,
        },
      );
    }
    const count =
      positionsCurrentDate && positionsCurrentDate[val]
        ? positionsCurrentDate[val].length.toString()
        : '0';
    return [
      ...memo,
      {
        id: val,
        style,
        title: t,
        count,
      },
    ];
  }, []);
};

export const getTickValuesX = chartData => {
  // console.log(chartData)
  const values = [];
  const minYear =
    chartData && chartData[1] && chartData[1][0] && chartData[1][0].sdate
      ? new Date(chartData[1][0].sdate).getFullYear()
      : 2021;
  const maxYear = new Date().getFullYear();
  /* eslint-disable no-plusplus */
  for (let y = minYear; y <= maxYear; y++) {
    values.push(new Date(y.toString()).getTime());
  }
  /* eslint-enable no-plusplus */
  return values;
};

const Y_BUFFER = 8;
export const getYRange = (chartData, chartDataSources, minDate) => {
  const yMax =
    chartData && chartData[2] && chartData[2].length > 0
      ? chartData[2][chartData[2].length - 1].y
      : 0;
  const yMin = chartDataSources
    ? chartDataSources.reduce((min, s) => Math.min(min, s.y), 0)
    : 0;
  return [
    {
      x: new Date(minDate).getTime(),
      y: yMin - Y_BUFFER,
    },
    {
      x: getXMax(),
      y: yMax + Y_BUFFER,
    },
  ];
};
// prettier-ignore
export const getMouseOverCover = (chartData, minDate) => {
  if (chartData[2][chartData[2].length - 1]) {
    const maxY = chartData[2][chartData[2].length - 1].y;
    return [
      {
        x: new Date(minDate).getTime(),
        y: maxY,
      },
      {
        x: new Date().getTime(),
        y: maxY,
      },
    ]
  }
  return null;
}

export const getPlotHeight = size => {
  if (isMinSize(size, 'large')) return 250;
  if (isMinSize(size, 'medium')) return 240;
  return 230;
};

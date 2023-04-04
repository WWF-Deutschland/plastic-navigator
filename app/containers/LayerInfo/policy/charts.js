import { DEFAULT_LOCALE } from 'i18n';
import { isMinSize } from 'utils/responsive';
import { getPositionForTopicAndValue } from 'utils/policy';

const getXTime = dateString => new Date(`${dateString}`).getTime();

const getDataForDate = (dateKey, positions, positionID, positionIDYOffsets) => {
  let y = 0;
  if (positionIDYOffsets) {
    positionIDYOffsets.forEach(positionIDYOffset => {
      if (positions[dateKey].positions[positionIDYOffset]) {
        y += positions[dateKey].positions[positionIDYOffset].length;
      }
    });
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

const dateBuffer = (nDays = 30) => 24 * 60 * 60 * 1000 * nDays;
export const getXMax = (nDays = 10) => new Date().getTime() + dateBuffer(nDays);

export const prepChartData = (positions, minDate) => {
  const data = Object.keys(positions).reduce(
    (memo, dateKey) => ({
      4: [
        ...memo[4],
        ...addStep(memo[4], getDataForDate(dateKey, positions, 4)),
      ],
      3: [
        ...memo[3],
        ...addStep(memo[3], getDataForDate(dateKey, positions, 3, [4])),
      ],
      2: [
        ...memo[2],
        ...addStep(memo[2], getDataForDate(dateKey, positions, 2, [3, 4])),
      ],
      1: [
        ...memo[1],
        ...addStep(memo[1], getDataForDate(dateKey, positions, 1, [2, 3, 4])),
      ],
    }),
    {
      4: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
      3: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
      2: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
      1: [{ sdate: minDate, scount: 0, y: 0, x: getXTime(minDate) }],
    },
  );
  return {
    4: [
      ...data[4],
      {
        sdate: 'today',
        scount: 0,
        y: data[4][data[4].length - 1].y,
        x: getXMax(),
      },
    ],
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
    if (positionsForDate && positionsForDate.sources) {
      const statementsForDate = positionsForDate.sources;
      const statementsByPosition = Object.keys(statementsForDate).reduce(
        (m2, statementId) => {
          const statement = statementsForDate[statementId];
          const posValue = statement.position.value;
          if (m2[posValue]) {
            return Object.assign({}, m2, {
              [posValue]: [...m2[posValue], statement],
            });
          }
          return {
            ...m2,
            [posValue]: [statement],
          };
        },
        {},
      );
      return Object.keys(statementsByPosition).reduce((m2, posValue) => {
        let y = Y_OFFSET_MIN * -1;
        const x = getXTime(dateKey);
        const prev = m2.length > 0 ? m2[m2.length - 1] : null;
        if (prev && x - prev.x < X_THRESHOLD) {
          y = prev.y - Y_OFFSET;
        }
        return [
          ...m2,
          {
            sdate: dateKey,
            sposition: posValue,
            sid: posValue,
            y,
            x,
            sources: statementsByPosition[posValue],
            color:
              dataStyles && dataStyles[posValue]
                ? dataStyles[posValue].fillColor
                : 'red',
          },
        ];
      }, memo);
    }
    return memo;
  }, []);
  return data;
};

export const prepChartKey = ({
  positionsCurrentDate,
  positionsLatestDate, // includes all positions
  indicatorId,
  tables,
  config,
  locale,
}) => {
  if (positionsCurrentDate && config['styles-by-value']) {
    return Object.keys(positionsLatestDate)
      .reduce((memo, posValue) => {
        const count = positionsCurrentDate[posValue]
          ? positionsCurrentDate[posValue].length
          : 0;
        const positionClean = getPositionForTopicAndValue({
          tables,
          indicatorId,
          positionValue: posValue,
        });
        return [
          ...memo,
          {
            id: posValue,
            value: posValue,
            style: config['styles-by-value'][posValue],
            title:
              positionClean[`position_short_${locale}`] ||
              positionClean[`position_short_${DEFAULT_LOCALE}`],
            count,
          },
        ];
      }, [])
      .sort((a, b) => (parseInt(a.value, 10) < parseInt(b.value, 10) ? 1 : -1));
  }
  return null;
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
export const getYRange = ({ countryCount, chartDataSources, minDate }) => {
  const yMax = countryCount + 5;
  const yMin = chartDataSources
    ? chartDataSources.reduce((min, s) => Math.min(min, s.y), 0)
    : 0;
  // console.log(yMin)
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
        x: getXMax(),
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

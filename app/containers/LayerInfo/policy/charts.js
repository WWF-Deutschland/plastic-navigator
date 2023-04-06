import { DEFAULT_LOCALE } from 'i18n';
import { isMinSize } from 'utils/responsive';
import { getPositionForTopicAndValue } from 'utils/policy';
const DATE_BUFFER_MAX = 60;
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

// days to ms
// 24 * 60 * 60 * 1000 = 86,400,000
const FACTOR_D2MS = 86400000;
const days2ms = days => days * FACTOR_D2MS;
const ms2days = ms => ms / FACTOR_D2MS;
export const getXMax = dateString =>
  (dateString ? new Date(dateString).getTime() : new Date().getTime()) +
  days2ms(DATE_BUFFER_MAX);

export const prepChartData = ({ positions, minDate, maxDate }) => {
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
        x: getXMax(maxDate),
      },
    ],
    3: [
      ...data[3],
      {
        sdate: 'today',
        scount: 0,
        y: data[3][data[3].length - 1].y,
        x: getXMax(maxDate),
      },
    ],
    2: [
      ...data[2],
      {
        sdate: 'today',
        scount: 0,
        y: data[2][data[2].length - 1].y,
        x: getXMax(maxDate),
      },
    ],
    1: [
      ...data[1],
      {
        sdate: 'today',
        scount: 0,
        y: data[1][data[1].length - 1].y,
        x: getXMax(maxDate),
      },
    ],
  };
};

// TODO: figure out a way to express in pixels rather than scaled values
// const X_THRESHOLD = 1600000000;
// const Y_OFFSET = 9;
const Y_OFFSET_MIN = 9;

export const prepChartDataSources = (positionsByDate, dataStyles) => {
  const sourceMarkers = Object.keys(positionsByDate).reduce(
    (memoSourceMarkers, dateKey) => {
      const positionsForDate = positionsByDate[dateKey];
      if (positionsForDate && positionsForDate.sources) {
        const statementsForDate = positionsForDate.sources;
        const y = Y_OFFSET_MIN * -1;
        const x = getXTime(dateKey);
        const sortedStatements = Object.values(statementsForDate).sort(
          (a, b) => {
            // const posValueA = parseInt(a.position.value, 10);
            // const posValueB = parseInt(b.position.value, 10);
            // return posValueA < posValueB ? 1 : -1;
            const countA = a.countryCodes.length;
            const countB = b.countryCodes.length;
            return countA < countB ? 1 : -1;
          },
          -99,
        );
        return [
          ...memoSourceMarkers,
          {
            sdate: dateKey,
            sposition: sortedStatements[0].position.value,
            sid: sortedStatements[0].id,
            y,
            x,
            sources: sortedStatements,
            opacity: 0.66,
            color:
              dataStyles && dataStyles[sortedStatements[0].position.value]
                ? dataStyles[sortedStatements[0].position.value].fillColor
                : 'red',
          },
        ];
      }
      return memoSourceMarkers;
    },
    [],
  );
  return sourceMarkers;
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
// days
const TICK_THRESHHOLD = 400;
const MONTH_INTERVAL = 1;

// credit https://stackoverflow.com/questions/2536379/difference-in-months-between-two-dates-in-javascript
function monthDiff(d1, d2) {
  let months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}
export const getTickValuesX = ({ chartData, maxDate, minDate }) => {
  // console.log(chartData)
  const values = [];
  const maxDateX = new Date(maxDate);
  const minDateX =
    chartData && chartData[1] && chartData[1][0] && chartData[1][0].sdate
      ? new Date(chartData[1][0].sdate)
      : new Date(minDate);

  // in days
  const timespan = ms2days(maxDateX.getTime()) - ms2days(minDateX.getTime());
  if (timespan > TICK_THRESHHOLD) {
    const minYear = minDate ? minDateX.getFullYear() : 2021;
    const maxYear = maxDateX.getFullYear();
    for (let y = minYear; y <= maxYear; y += 1) {
      values.push(new Date(y.toString()).getTime());
    }
  } else {
    const spanMonths = Math.max(monthDiff(minDateX, maxDateX), 6);
    for (let m = 0; m <= spanMonths; m += MONTH_INTERVAL) {
      const step = m * MONTH_INTERVAL;
      const dateMin = new Date(minDateX.getTime());
      const date = new Date(dateMin.setMonth(dateMin.getMonth() + step));
      if (date.getTime() < new Date().getTime()) values.push(date.getTime());
    }
  }
  return values;
};

const Y_BUFFER = 8;
export const getYRange = ({
  countryCount,
  chartDataSources,
  minDate,
  maxDate,
}) => {
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
      x: getXMax(maxDate),
      y: yMax + Y_BUFFER,
    },
  ];
};
// prettier-ignore
export const getMouseOverCover = ({ chartData, minDate, maxDate }) => {
  if (chartData[2][chartData[2].length - 1]) {
    const maxY = chartData[2][chartData[2].length - 1].y;
    return [
      {
        x: new Date(minDate).getTime(),
        y: maxY,
      },
      {
        x: getXMax(maxDate),
        y: maxY,
      },
    ]
  }
  return null;
}

export const getPlotHeight = ({ size, hasStatements }) => {
  if (isMinSize(size, 'large')) return hasStatements ? 220 : 180;
  if (isMinSize(size, 'medium')) return hasStatements ? 200 : 170;
  return 230;
};

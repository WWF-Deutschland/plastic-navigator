import { DEFAULT_LOCALE } from 'i18n';
import { isMinSize } from 'utils/responsive';
import {
  getPositionForTopicAndValue,
  getAggregateValueForStatement,
} from 'utils/policy';
import { formatMessageForValues } from 'utils/string';
const DATE_BUFFER_ARCHIVED = 60;
const DATE_BUFFER_CURRENT = 3;
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

export const getMaxDate = (lastDateString, isArchive) => {
  const lastDate = new Date(lastDateString);
  // default to today
  let maxDate = new Date();
  // unless archived: add min buffer
  if (lastDateString) {
    if (isArchive) {
      const maxTime = lastDate.getTime() + days2ms(DATE_BUFFER_ARCHIVED);
      maxDate = new Date(maxTime);
    } else if (
      maxDate.getTime() - lastDate.getTime() <
      days2ms(DATE_BUFFER_CURRENT)
    ) {
      // or last date is too recent
      const maxTime = lastDate.getTime() + days2ms(DATE_BUFFER_CURRENT);
      maxDate = new Date(maxTime);
    }
  }
  const year = maxDate.getFullYear();
  const month = `0${maxDate.getMonth() + 1}`.slice(-2);
  const day = `0${maxDate.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
};
// export const getXMax = maxDateString => new Date(maxDateString).getTime();

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
        x: new Date(maxDate).getTime(),
      },
    ],
    3: [
      ...data[3],
      {
        sdate: 'today',
        scount: 0,
        y: data[3][data[3].length - 1].y,
        x: new Date(maxDate).getTime(),
      },
    ],
    2: [
      ...data[2],
      {
        sdate: 'today',
        scount: 0,
        y: data[2][data[2].length - 1].y,
        x: new Date(maxDate).getTime(),
      },
    ],
    1: [
      ...data[1],
      {
        sdate: 'today',
        scount: 0,
        y: data[1][data[1].length - 1].y,
        x: new Date(maxDate).getTime(),
      },
    ],
  };
};

// TODO: figure out a way to express in pixels rather than scaled values
// const X_THRESHOLD = 1600000000;
// const Y_OFFSET = 9;
const Y_OFFSET_MIN = 9;

export const prepChartDataSources = (
  positionsByDate,
  dataStyles,
  childTopicIds,
) => {
  const sourceMarkers = Object.keys(positionsByDate).reduce(
    (memoSourceMarkers, dateKey) => {
      const positionsForDate = positionsByDate[dateKey];
      if (positionsForDate) {
        const statementsForDate = positionsForDate.sources;
        const x = getXTime(dateKey);
        const sortedStatements =
          statementsForDate &&
          Object.values(statementsForDate).sort((a, b) => {
            // const posValueA = parseInt(a.position.value, 10);
            // const posValueB = parseInt(b.position.value, 10);
            // return posValueA < posValueB ? 1 : -1;
            const countA = a.countryCodes.length;
            const countB = b.countryCodes.length;
            return countA < countB ? 1 : -1;
          }, -99);
        let color = 'red';
        if (sortedStatements && dataStyles) {
          if (childTopicIds) {
            // console.log('sortedStatements[0]', sortedStatements[0])
            const value = getAggregateValueForStatement(
              sortedStatements[0],
              childTopicIds,
            );
            color = dataStyles[value].fillColor;
          } else if (dataStyles[sortedStatements[0].position.value]) {
            color = dataStyles[sortedStatements[0].position.value].fillColor;
          }
        }
        return [
          ...memoSourceMarkers,
          {
            sdate: dateKey,
            sposition: sortedStatements
              ? sortedStatements[0].position.value
              : null,
            sid: sortedStatements ? sortedStatements[0].id : null,
            y: Y_OFFSET_MIN * -1,
            x,
            sources: sortedStatements,
            opacity: 0.66,
            color,
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
  positionsOverTime,
  chartDate, //  optional
  indicatorId,
  tables,
  config,
  locale,
  intl,
}) => {
  const lastDate =
    positionsOverTime &&
    Object.keys(positionsOverTime)[Object.keys(positionsOverTime).length - 1];
  const cleanChartDate = chartDate || lastDate;

  const positionsCurrentDate = positionsOverTime[lastDate].positions;
  const positionsLatestDate = positionsOverTime[cleanChartDate].positions;
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
        // prettier-ignore
        const title = intl
          ? formatMessageForValues({
            intl,
            message:
              positionClean[`position_short_${locale}`] ||
              positionClean[`position_short_${DEFAULT_LOCALE}`],
            values: { isSingle: false },
          })
          : positionClean[`position_short_${locale}`] ||
            positionClean[`position_short_${DEFAULT_LOCALE}`];
        return [
          ...memo,
          {
            id: posValue,
            value: posValue,
            style: config['styles-by-value'][posValue],
            title,
            count,
          },
        ];
      }, [])
      .sort((a, b) => (parseInt(a.value, 10) < parseInt(b.value, 10) ? 1 : -1));
  }
  return null;
};
// days
const TICK_THRESHHOLD_YEAR = 400;
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
  // show yearly ticks
  if (timespan > TICK_THRESHHOLD_YEAR) {
    const minYear = minDate ? minDateX.getFullYear() : 2021;
    const maxYear = maxDateX.getFullYear();
    for (let y = minYear; y <= maxYear; y += 1) {
      values.push(new Date(y.toString()).getTime());
    }
  } else {
    // show monthly ticks
    const spanMonths = Math.max(monthDiff(minDateX, maxDateX), 6);
    for (let m = 0; m <= spanMonths; m += MONTH_INTERVAL) {
      const step = m * MONTH_INTERVAL;
      const dateMin = new Date(minDateX.getTime());
      const date = new Date(dateMin.setMonth(dateMin.getMonth() + step));
      if (date.getTime() < new Date(maxDate).getTime()) {
        values.push(date.getTime());
      }
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
      x: new Date(maxDate).getTime(),
      y: yMax + Y_BUFFER,
    },
  ];
};
// prettier-ignore
export const getMouseOverCover = ({ chartData, minDate, maxDate, countryCount }) => {
  if (chartData[2][chartData[2].length - 1]) {
    const maxY = countryCount + 5;
    return [
      {
        x: new Date(minDate).getTime(),
        y: maxY,
      },
      {
        x: new Date(maxDate).getTime(),
        y: maxY,
      },
    ]
  }
  return null;
}

export const getPlotHeight = ({ size, hasStatements }) => {
  if (isMinSize(size, 'large')) return hasStatements ? 220 : 180;
  if (isMinSize(size, 'medium')) return hasStatements ? 200 : 170;
  return hasStatements ? 160 : 140;
};

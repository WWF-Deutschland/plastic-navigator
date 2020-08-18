import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { injectIntl, intlShape } from 'react-intl';
import { DEFAULT_LOCALE } from 'i18n';
import { Box } from 'grommet';
const Styled = styled.div``;

const exists = str => str && str.trim().length > 0;

const TooltipProjectContent = ({ location, project, intl }) => {
  const { locale } = intl;
  const hasLocationImage = location && exists(location.image_url);
  const imageAttribution = hasLocationImage
    ? location[`image_attribution_${locale}`] ||
      location[`image_attribution_${DEFAULT_LOCALE}`]
    : project[`image_attribution_${locale}`] ||
      project[`image_attribution_${DEFAULT_LOCALE}`];
  let imageURL = hasLocationImage ? location.image_url : project.image_url;
  const imageURLcomponents = imageURL && imageURL.split('.');
  imageURL =
    imageURLcomponents &&
    imageURLcomponents.reduce((m, str, i) => {
      if (i === imageURLcomponents.length - 1) {
        return `${m}_small.${str}`;
      }
      return m ? `${m}.${str}` : str;
    }, null);
  return (
    <Styled>
      {exists(imageURL) && (
        <Box margin={{ bottom: 'small' }}>
          <figure className="mpx-figure">
            <div className="mpx-image-wrap">
              <img className="mpx-img" src={imageURL} alt={imageAttribution} />
            </div>
          </figure>
        </Box>
      )}
    </Styled>
  );
};

TooltipProjectContent.propTypes = {
  location: PropTypes.object, // the layer configuration
  project: PropTypes.object, // the feature
  intl: intlShape.isRequired,
};

export default injectIntl(TooltipProjectContent);

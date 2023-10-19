const getFeatureStyle2 = (feature, template) => {
  const step = template.limits.find((limit) => {
    return feature.properties.Result < limit;
  });
  const index = template.limits.indexOf(step);
  const color =
    index !== -1
      ? template.colors[index]
      : template.colors[template.colors.length - 1];
  return Object.assign(template, {
    fillColor: color,
    fillOpacity: 1,
    radius: 6,
    weight: 1,
  });
};

const getValueStyle = (value, template) => {
  const step = template.limits.find((limit) => {
    return value <= limit;
  });
  const index = template.limits.indexOf(step);
  const color =
    index !== -1
      ? template.colors[index]
      : template.colors[template.colors.length - 1];
  return Object.assign(template, {
    fillColor: color,
    fillOpacity: 1,
    radius: 6,
    weight: 1,
  });
};

export default getValueStyle;

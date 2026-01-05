const importAll = (r) => {
  	return r.keys().map((key) => r(key).default);
};
  
const importedClasses = importAll(require.context('./', true, /ThreeObject\.js$/));

export default importedModules;
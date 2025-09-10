export const dowloadInsuredArtifact = async (
  fileRefetch: any,
  file_uri: string,
  file_type: string,
  done: () => void
) => {
  const { error, data } = await fileRefetch({
    filename: suffix(file_uri, '.pdf'),
  });

  if (!error && data.getIpfsFile?.filedata) {
    var URLToPDF = `${data.getIpfsFile?.filedata}`;
    var fileName = file_type;
    var req = new XMLHttpRequest();
    req.open("GET", URLToPDF, true);
    req.responseType = "blob";
    req.onload = function () {
      var blob = new Blob([req.response], { type: "application/pdf" });
      var link;
      var url = window.URL || window.webkitURL;
      link = url.createObjectURL(blob);
      var a = document.createElement("a");
      a.setAttribute("download", fileName);
      a.setAttribute("href", link);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      done();
    };
    req.send();
  }
};

const suffix = (str: string, suffix: string) => {
  if (!str || !suffix) {
    return str;
  }
  console.log(str, suffix);
  return str.trim().toLocaleLowerCase().endsWith(suffix.toLocaleLowerCase()) ? str : str + suffix;
}
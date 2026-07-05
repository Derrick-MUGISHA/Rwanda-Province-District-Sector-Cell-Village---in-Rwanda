package io.github.derickmugisha.rwanda.model;

import java.util.List;

public class RwandaDataset {
  private String country;
  private String version;
  private String dataVersion;
  private String source;
  private String sourceDate;
  private String license;
  private String codeStandard;
  private List<Province> provinces;

  public String getCountry() {
    return country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public String getVersion() {
    return version;
  }

  public void setVersion(String version) {
    this.version = version;
  }

  public String getDataVersion() {
    return dataVersion;
  }

  public void setDataVersion(String dataVersion) {
    this.dataVersion = dataVersion;
  }

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }

  public String getSourceDate() {
    return sourceDate;
  }

  public void setSourceDate(String sourceDate) {
    this.sourceDate = sourceDate;
  }

  public String getLicense() {
    return license;
  }

  public void setLicense(String license) {
    this.license = license;
  }

  public String getCodeStandard() {
    return codeStandard;
  }

  public void setCodeStandard(String codeStandard) {
    this.codeStandard = codeStandard;
  }

  public List<Province> getProvinces() {
    return provinces;
  }

  public void setProvinces(List<Province> provinces) {
    this.provinces = provinces;
  }
}

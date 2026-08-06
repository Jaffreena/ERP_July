using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{

    public class RNNumber_DTO
    {
        public Int64 RNN_Number { get; set; }
        public String? RNN_Method { get; set; }
        public String? RNN_Date { get; set; }
        public String? RNN_EndDate { get; set; }
        public String? RNN_StartingNumber { get; set; }
        public String? RNN_NumberofDigits { get; set; }
        public String? RNN_PrefilZero { get; set; }
        public String? RNN_Frequency { get; set; }
        public String? RNN_Particulars { get; set; }

        public List<RNNumberReset_DTO>? RNNumberReset { get; set; }
        public List<RNNumberPrefix_DTO>? RNNumberPrefix { get; set; }
        public List<RNNumberSuffix_DTO>? RNNumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.RNN_Number = 0;
            this.RNN_Date = "0";
            this.RNN_Method = "0";
            this.RNN_StartingNumber = "0";
            this.RNN_NumberofDigits = "0";
            this.RNN_PrefilZero = "0";
            this.RNN_Frequency = "0";
            this.DeleteNumbers = "0";
            this.RNNumberReset = null;
            this.RNNumberPrefix = null;
            this.RNNumberSuffix = null;
        }
    }

    public class RNNumberReset_DTO
    {
        public Int64 RNR_Number { get; set; }
        public String? RNR_Date { get; set; }
        public String? RNR_EndDate { get; set; }
        public String? RNR_StartingNumber { get; set; }
        public String? RNR_NumberofDigits { get; set; }
        public String? RNR_PrefilZero { get; set; }
        public String? RNR_Frequency { get; set; }
        public Boolean RNR_IsDeleted { get; set; }

        public void Reset()
        {
            this.RNR_Number = 0;
            this.RNR_Date = "";
            this.RNR_EndDate = "";
            this.RNR_StartingNumber = "";
            this.RNR_NumberofDigits = "";
            this.RNR_PrefilZero = "";
            this.RNR_Frequency = "";
            this.RNR_IsDeleted = false;
        }
    }
    public class RNNumberPrefix_DTO
    {
        public Int64 RNP_Number { get; set; }
        public String? RNP_Date { get; set; }
        public String? RNP_EndDate { get; set; }
        public String? RNP_Particulars { get; set; }
        public Boolean RNP_IsDeleted { get; set; }

        public void Reset()
        {
            this.RNP_Number = 0;
            this.RNP_Date = "";
            this.RNP_EndDate = "";
            
            this.RNP_Particulars = "";
            this.RNP_IsDeleted = false;
        }
    }
    public class RNNumberSuffix_DTO
    {
        public Int64 RNS_Number { get; set; }
        public String? RNS_Date { get; set; }
        public String? RNS_EndDate { get; set; }
        public String? RNS_Particulars { get; set; }
        public Boolean RNS_IsDeleted { get; set; }

        public void Reset()
        {
            this.RNS_Number = 0;
            this.RNS_Date = "";
            this.RNS_EndDate = "";
            this.RNS_Particulars = "";
            this.RNS_IsDeleted = false;
        }
    }

    #region delivery note
    public class DNNumber_DTO
    {
        public Int64 DNN_Number { get; set; }
        public String? DNN_Method { get; set; }
        public String? DNN_Date { get; set; }
        public String? DNN_EndDate { get; set; }
        public String? DNN_StartingNumber { get; set; }
        public String? DNN_NumberofDigits { get; set; }
        public String? DNN_PrefilZero { get; set; }
        public String? DNN_Frequency { get; set; }
        public String? DNN_Particulars { get; set; }

        public List<DNNumberReset_DTO>? DNNumberReset { get; set; }
        public List<DNNumberPrefix_DTO>? DNNumberPrefix { get; set; }
        public List<DNNumberSuffix_DTO>? DNNumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.DNN_Number = 0;
            this.DNN_Date = "0";
            this.DNN_Method = "0";
            this.DNN_StartingNumber = "0";
            this.DNN_NumberofDigits = "0";
            this.DNN_PrefilZero = "0";
            this.DNN_Frequency = "0";
            this.DeleteNumbers = "0";
            this.DNNumberReset = null;
            this.DNNumberPrefix = null;
            this.DNNumberSuffix = null;
        }
    }

    public class DNNumberReset_DTO
    {
        public Int64 DNR_Number { get; set; }
        public String? DNR_Date { get; set; }
        public String? DNR_EndDate { get; set; }
        public String? DNR_StartingNumber { get; set; }
        public String? DNR_NumberofDigits { get; set; }
        public String? DNR_PrefilZero { get; set; }
        public String? DNR_Frequency { get; set; }
        public Boolean DNR_IsDeleted { get; set; }

        public void Reset()
        {
            this.DNR_Number = 0;
            this.DNR_Date = "";
            this.DNR_EndDate = "";
            this.DNR_StartingNumber = "";
            this.DNR_NumberofDigits = "";
            this.DNR_PrefilZero = "";
            this.DNR_Frequency = "";
            this.DNR_IsDeleted = false;
        }
    }

    public class DNNumberPrefix_DTO
    {
        public Int64 DNP_Number { get; set; }
        public String? DNP_Date { get; set; }
        public String? DNP_EndDate { get; set; }
        public String? DNP_Particulars { get; set; }
        public Boolean DNP_IsDeleted { get; set; }

        public void Reset()
        {
            this.DNP_Number = 0;
            this.DNP_Date = "";
            this.DNP_EndDate = "";
            this.DNP_Particulars = "";
            this.DNP_IsDeleted = false;
        }
    }

    public class DNNumberSuffix_DTO
    {
        public Int64 DNS_Number { get; set; }
        public String? DNS_Date { get; set; }
        public String? DNS_EndDate { get; set; }
        public String? DNS_Particulars { get; set; }
        public Boolean DNS_IsDeleted { get; set; }

        public void Reset()
        {
            this.DNS_Number = 0;
            this.DNS_Date = "";
            this.DNS_EndDate = "";
            this.DNS_Particulars = "";
            this.DNS_IsDeleted = false;
        }
    }
    #endregion

    #region jw invoice

    public class JINumber_DTO
    {
        public Int64 JIN_Number { get; set; }
        public String? JIN_Method { get; set; }
        public String? JIN_Date { get; set; }
        public String? JIN_EndDate { get; set; }
        public String? JIN_StartingNumber { get; set; }
        public String? JIN_NumberofDigits { get; set; }
        public String? JIN_PrefilZero { get; set; }
        public String? JIN_Frequency { get; set; }
        public String? JIN_Particulars { get; set; }

        public List<JINumberReset_DTO>? JINumberReset { get; set; }
        public List<JINumberPrefix_DTO>? JINumberPrefix { get; set; }
        public List<JINumberSuffix_DTO>? JINumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JIN_Number = 0;
            this.JIN_Date = "0";
            this.JIN_Method = "0";
            this.JIN_StartingNumber = "0";
            this.JIN_NumberofDigits = "0";
            this.JIN_PrefilZero = "0";
            this.JIN_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JINumberReset = null;
            this.JINumberPrefix = null;
            this.JINumberSuffix = null;
        }
    }

    public class JINumberReset_DTO
    {
        public Int64 JIR_Number { get; set; }
        public String? JIR_Date { get; set; }
        public String? JIR_EndDate { get; set; }
        public String? JIR_StartingNumber { get; set; }
        public String? JIR_NumberofDigits { get; set; }
        public String? JIR_PrefilZero { get; set; }
        public String? JIR_Frequency { get; set; }
        public Boolean JIR_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIR_Number = 0;
            this.JIR_Date = "";
            this.JIR_EndDate = "";
            this.JIR_StartingNumber = "";
            this.JIR_NumberofDigits = "";
            this.JIR_PrefilZero = "";
            this.JIR_Frequency = "";
            this.JIR_IsDeleted = false;
        }
    }

    public class JINumberPrefix_DTO
    {
        public Int64 JIP_Number { get; set; }
        public String? JIP_Date { get; set; }
        public String? JIP_EndDate { get; set; }
        public String? JIP_Particulars { get; set; }
        public Boolean JIP_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIP_Number = 0;
            this.JIP_Date = "";
            this.JIP_EndDate = "";
            this.JIP_Particulars = "";
            this.JIP_IsDeleted = false;
        }
    }

    public class JINumberSuffix_DTO
    {
        public Int64 JIS_Number { get; set; }
        public String? JIS_Date { get; set; }
        public String? JIS_EndDate { get; set; }
        public String? JIS_Particulars { get; set; }
        public Boolean JIS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIS_Number = 0;
            this.JIS_Date = "";
            this.JIS_EndDate = "";
            this.JIS_Particulars = "";
            this.JIS_IsDeleted = false;
        }
    }

    #endregion
  
    #region job service order

    public class JSONumber_DTO
    {
        public Int64 JSON_Number { get; set; }
        public String? JSON_Method { get; set; }
        public String? JSON_Date { get; set; }
        public String? JSON_EndDate { get; set; }
        public String? JSON_StartingNumber { get; set; }
        public String? JSON_NumberofDigits { get; set; }
        public String? JSON_PrefilZero { get; set; }
        public String? JSON_Frequency { get; set; }
        public String? JSON_Particulars { get; set; }

        public List<JSONumberReset_DTO>? JSONumberReset { get; set; }
        public List<JSONumberPrefix_DTO>? JSONumberPrefix { get; set; }
        public List<JSONumberSuffix_DTO>? JSONumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JSON_Number = 0;
            this.JSON_Date = "0";
            this.JSON_Method = "0";
            this.JSON_StartingNumber = "0";
            this.JSON_NumberofDigits = "0";
            this.JSON_PrefilZero = "0";
            this.JSON_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JSONumberReset = null;
            this.JSONumberPrefix = null;
            this.JSONumberSuffix = null;
        }
    }

    public class JSONumberReset_DTO
    {
        public Int64 JSOR_Number { get; set; }
        public String? JSOR_Date { get; set; }
        public String? JSOR_EndDate { get; set; }
        public String? JSOR_StartingNumber { get; set; }
        public String? JSOR_NumberofDigits { get; set; }
        public String? JSOR_PrefilZero { get; set; }
        public String? JSOR_Frequency { get; set; }
        public Boolean JSOR_IsDeleted { get; set; }

        public void Reset()
        {
            this.JSOR_Number = 0;
            this.JSOR_Date = "";
            this.JSOR_EndDate = "";
            this.JSOR_StartingNumber = "";
            this.JSOR_NumberofDigits = "";
            this.JSOR_PrefilZero = "";
            this.JSOR_Frequency = "";
            this.JSOR_IsDeleted = false;
        }
    }

    public class JSONumberPrefix_DTO
    {
        public Int64 JSOP_Number { get; set; }
        public String? JSOP_Date { get; set; }
        public String? JSOP_EndDate { get; set; }
        public String? JSOP_Particulars { get; set; }
        public Boolean JSOP_IsDeleted { get; set; }

        public void Reset()
        {
            this.JSOP_Number = 0;
            this.JSOP_Date = "";
            this.JSOP_EndDate = "";
            this.JSOP_Particulars = "";
            this.JSOP_IsDeleted = false;
        }
    }

    public class JSONumberSuffix_DTO
    {
        public Int64 JSOS_Number { get; set; }
        public String? JSOS_Date { get; set; }
        public String? JSOS_EndDate { get; set; }
        public String? JSOS_Particulars { get; set; }
        public Boolean JSOS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JSOS_Number = 0;
            this.JSOS_Date = "";
            this.JSOS_EndDate = "";
            this.JSOS_Particulars = "";
            this.JSOS_IsDeleted = false;
        }
    }

    #endregion
    #region job inward conversion

    public class JI_CONVNumber_DTO
    {
        public Int64 JICN_Number { get; set; }
        public String? JICN_Method { get; set; }
        public String? JICN_Date { get; set; }
        public String? JICN_EndDate { get; set; }
        public String? JICN_StartingNumber { get; set; }
        public String? JICN_NumberofDigits { get; set; }
        public String? JICN_PrefilZero { get; set; }
        public String? JICN_Frequency { get; set; }
        public String? JICN_Particulars { get; set; }

        public List<JI_CONVNumberReset_DTO>? JI_CONVNumberReset { get; set; }
        public List<JI_CONVNumberPrefix_DTO>? JI_CONVNumberPrefix { get; set; }
        public List<JI_CONVNumberSuffix_DTO>? JI_CONVNumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JICN_Number = 0;
            this.JICN_Date = "0";
            this.JICN_Method = "0";
            this.JICN_StartingNumber = "0";
            this.JICN_NumberofDigits = "0";
            this.JICN_PrefilZero = "0";
            this.JICN_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JI_CONVNumberReset = null;
            this.JI_CONVNumberPrefix = null;
            this.JI_CONVNumberSuffix = null;
        }
    }

    public class JI_CONVNumberReset_DTO
    {
        public Int64 JICR_Number { get; set; }
        public String? JICR_Date { get; set; }
        public String? JICR_EndDate { get; set; }
        public String? JICR_StartingNumber { get; set; }
        public String? JICR_NumberofDigits { get; set; }
        public String? JICR_PrefilZero { get; set; }
        public String? JICR_Frequency { get; set; }
        public Boolean JICR_IsDeleted { get; set; }

        public void Reset()
        {
            this.JICR_Number = 0;
            this.JICR_Date = "";
            this.JICR_EndDate = "";
            this.JICR_StartingNumber = "";
            this.JICR_NumberofDigits = "";
            this.JICR_PrefilZero = "";
            this.JICR_Frequency = "";
            this.JICR_IsDeleted = false;
        }
    }

    public class JI_CONVNumberPrefix_DTO
    {
        public Int64 JICP_Number { get; set; }
        public String? JICP_Date { get; set; }
        public String? JICP_EndDate { get; set; }
        public String? JICP_Particulars { get; set; }
        public Boolean JICP_IsDeleted { get; set; }

        public void Reset()
        {
            this.JICP_Number = 0;
            this.JICP_Date = "";
            this.JICP_EndDate = "";
            this.JICP_Particulars = "";
            this.JICP_IsDeleted = false;
        }
    }

    public class JI_CONVNumberSuffix_DTO
    {
        public Int64 JICS_Number { get; set; }
        public String? JICS_Date { get; set; }
        public String? JICS_EndDate { get; set; }
        public String? JICS_Particulars { get; set; }
        public Boolean JICS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JICS_Number = 0;
            this.JICS_Date = "";
            this.JICS_EndDate = "";
            this.JICS_Particulars = "";
            this.JICS_IsDeleted = false;
        }
    }

    #endregion

}

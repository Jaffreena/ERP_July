using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DTO.JobInwardTransaction
{

    public class JIRN_Numbering_DTO
    {
        public Int64 JIRN_Number { get; set; }
        public String? JIRN_Method { get; set; }
        public String? JIRN_Date { get; set; }
        public String? JIRN_EndDate { get; set; }
        public String? JIRN_StartingNumber { get; set; }
        public String? JIRN_NumberofDigits { get; set; }
        public String? JIRN_PrefilZero { get; set; }
        public String? JIRN_Frequency { get; set; }
        public String? JIRN_Particulars { get; set; }

        public List<JIRN_NumberReset_DTO>? JIRN_NumberReset { get; set; }
        public List<JIRN_NumberPrefix_DTO>? JIRN_NumberPrefix { get; set; }
        public List<JIRN_NumberSuffix_DTO>? JIRN_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JIRN_Number = 0;
            this.JIRN_Date = "0";
            this.JIRN_Method = "0";
            this.JIRN_StartingNumber = "0";
            this.JIRN_NumberofDigits = "0";
            this.JIRN_PrefilZero = "0";
            this.JIRN_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JIRN_NumberReset = null;
            this.JIRN_NumberPrefix = null;
            this.JIRN_NumberSuffix = null;
        }
    }

    public class JIRN_NumberReset_DTO
    {
        public Int64 JIRN_NRS_Number { get; set; }
        public String? JIRN_NRS_StartDate { get; set; }
        public String? JIRN_NRS_EndDate { get; set; }
        public String? JIRN_NRS_StartingNumber { get; set; }
        public String? JIRN_NRS_NumberofDigits { get; set; }
        public String? JIRN_NRS_PrefilZero { get; set; }
        public String? JIRN_NRS_Frequency { get; set; }
        public Boolean JIRN_NRS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIRN_NRS_Number = 0;
            this.JIRN_NRS_StartDate = "";
            this.JIRN_NRS_EndDate = "";
            this.JIRN_NRS_StartingNumber = "";
            this.JIRN_NRS_NumberofDigits = "";
            this.JIRN_NRS_PrefilZero = "";
            this.JIRN_NRS_Frequency = "";
            this.JIRN_NRS_IsDeleted = false;
        }
    }
    public class JIRN_NumberPrefix_DTO
    {
        public Int64 JIRN_PFX_Number { get; set; }
        public String? JIRN_PFX_StartDate { get; set; }
        public String? JIRN_PFX_EndDate { get; set; }
        public String? JIRN_PFX_Particulars { get; set; }
        public Boolean JIRN_PFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIRN_PFX_Number = 0;
            this.JIRN_PFX_StartDate = "";
            this.JIRN_PFX_EndDate = "";
            this.JIRN_PFX_Particulars = "";
            this.JIRN_PFX_IsDeleted = false;
        }
    }
    public class JIRN_NumberSuffix_DTO
    {
        public Int64 JIRN_SFX_Number { get; set; }
        public String? JIRN_SFX_StartDate { get; set; }
        public String? JIRN_SFX_EndDate { get; set; }
        public String? JIRN_SFX_Particulars { get; set; }
        public Boolean JIRN_SFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIRN_SFX_Number = 0;
            this.JIRN_SFX_StartDate = "";
            this.JIRN_SFX_EndDate = "";
            this.JIRN_SFX_Particulars = "";
            this.JIRN_SFX_IsDeleted = false;
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

        public List<JIDN_NumberReset_DTO>? DNNumberReset { get; set; }
        public List<JIDN_NumberPrefix_DTO>? DNNumberPrefix { get; set; }
        public List<JIDN_NumberSuffix_DTO>? DNNumberSuffix { get; set; }

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

    public class JIDN_NumberReset_DTO
    {
        public Int64 JIDN_NR_Number { get; set; }
        public String? JIDN_NR_Date { get; set; }
        public String? JIDN_NR_EndDate { get; set; }
        public String? JIDN_NR_StartingNumber { get; set; }
        public String? JIDN_NR_NumberofDigits { get; set; }
        public String? JIDN_NR_PrefilZero { get; set; }
        public String? JIDN_NR_Frequency { get; set; }
        public Boolean DNR_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIDN_NR_Number = 0;
            this.JIDN_NR_Date = "";
            this.JIDN_NR_EndDate = "";
            this.JIDN_NR_StartingNumber = "";
            this.JIDN_NR_NumberofDigits = "";
            this.JIDN_NR_PrefilZero = "";
            this.JIDN_NR_Frequency = "";
            this.DNR_IsDeleted = false;
        }
    }

    public class JIDN_NumberPrefix_DTO
    {
        public Int64 JIDN_Prefix_Number { get; set; }
        public String? JIDN_Prefix_Date { get; set; }
        public String? JIDN_Prefix_EndDate { get; set; }
        public String? JIDN_Prefix_Particulars { get; set; }
        public Boolean DNP_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIDN_Prefix_Number = 0;
            this.JIDN_Prefix_Date = "";
            this.JIDN_Prefix_EndDate = "";
            this.JIDN_Prefix_Particulars = "";
            this.DNP_IsDeleted = false;
        }
    }

    public class JIDN_NumberSuffix_DTO
    {
        public Int64 JIDN_Suffix_Number { get; set; }
        public String? JIDN_Suffix_Date { get; set; }
        public String? JIDN_Suffix_EndDate { get; set; }
        public String? JIDN_Suffix_Particulars { get; set; }
        public Boolean DNS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIDN_Suffix_Number = 0;
            this.JIDN_Suffix_Date = "";
            this.JIDN_Suffix_EndDate = "";
            this.JIDN_Suffix_Particulars = "";
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

    #region JIJWI service order

    public class JIJWI_SVO_Numbering_DTO
    {
        public Int64 JIJWI_SVO_Number { get; set; }
        public String? JIJWI_SVO_Method { get; set; }
        public String? JIJWI_SVO_Date { get; set; }
        public String? JIJWI_SVO_EndDate { get; set; }
        public String? JIJWI_SVO_StartingNumber { get; set; }
        public String? JIJWI_SVO_NumberofDigits { get; set; }
        public String? JIJWI_SVO_PrefilZero { get; set; }
        public String? JIJWI_SVO_Frequency { get; set; }
        public String? JIJWI_SVO_Particulars { get; set; }

        public List<JIJWI_SVO_NumberReset_DTO>? JIJWI_SVO_NumberReset { get; set; }
        public List<JIJWI_SVO_NumberPrefix_DTO>? JIJWI_SVO_NumberPrefix { get; set; }
        public List<JIJWI_SVO_NumberSuffix_DTO>? JIJWI_SVO_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JIJWI_SVO_Number = 0;
            this.JIJWI_SVO_Date = "0";
            this.JIJWI_SVO_Method = "0";
            this.JIJWI_SVO_StartingNumber = "0";
            this.JIJWI_SVO_NumberofDigits = "0";
            this.JIJWI_SVO_PrefilZero = "0";
            this.JIJWI_SVO_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JIJWI_SVO_NumberReset = null;
            this.JIJWI_SVO_NumberPrefix = null;
            this.JIJWI_SVO_NumberSuffix = null;
        }
    }

    public class JIJWI_SVO_NumberReset_DTO
    {
        public Int64 JIJWI_SVO_NRS_Number { get; set; }
        public String? JIJWI_SVO_NRS_StartDate { get; set; }
        public String? JIJWI_SVO_NRS_EndDate { get; set; }
        public String? JIJWI_SVO_NRS_StartingNumber { get; set; }
        public String? JIJWI_SVO_NRS_NumberofDigits { get; set; }
        public String? JIJWI_SVO_NRS_PrefilZero { get; set; }
        public String? JIJWI_SVO_NRS_Frequency { get; set; }
        public Boolean JIJWI_SVO_NRS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIJWI_SVO_NRS_Number = 0;
            this.JIJWI_SVO_NRS_StartDate = "";
            this.JIJWI_SVO_NRS_EndDate = "";
            this.JIJWI_SVO_NRS_StartingNumber = "";
            this.JIJWI_SVO_NRS_NumberofDigits = "";
            this.JIJWI_SVO_NRS_PrefilZero = "";
            this.JIJWI_SVO_NRS_Frequency = "";
            this.JIJWI_SVO_NRS_IsDeleted = false;
        }
    }

    public class JIJWI_SVO_NumberPrefix_DTO
    {
        public Int64 JIJWI_SVO_PFX_Number { get; set; }
        public String? JIJWI_SVO_PFX_StartDate { get; set; }
        public String? JIJWI_SVO_PFX_EndDate { get; set; }
        public String? JIJWI_SVO_PFX_Particulars { get; set; }
        public Boolean JIJWI_SVO_PFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIJWI_SVO_PFX_Number = 0;
            this.JIJWI_SVO_PFX_StartDate = "";
            this.JIJWI_SVO_PFX_EndDate = "";
            this.JIJWI_SVO_PFX_Particulars = "";
            this.JIJWI_SVO_PFX_IsDeleted = false;
        }
    }

    public class JIJWI_SVO_NumberSuffix_DTO
    {
        public Int64 JIJWI_SVO_SFX_Number { get; set; }
        public String? JIJWI_SVO_SFX_StartDate { get; set; }
        public String? JIJWI_SVO_SFX_EndDate { get; set; }
        public String? JIJWI_SVO_SFX_Particulars { get; set; }
        public Boolean JIJWI_SVO_SFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIJWI_SVO_SFX_Number = 0;
            this.JIJWI_SVO_SFX_StartDate = "";
            this.JIJWI_SVO_SFX_EndDate = "";
            this.JIJWI_SVO_SFX_Particulars = "";
            this.JIJWI_SVO_SFX_IsDeleted = false;
        }
    }

    #endregion
    #region JIFRT service order

    public class JIFRT_SVO_Numbering_DTO
    {
        public Int64 JIFRT_SVO_Number { get; set; }
        public String? JIFRT_SVO_Method { get; set; }
        public String? JIFRT_SVO_Date { get; set; }
        public String? JIFRT_SVO_EndDate { get; set; }
        public String? JIFRT_SVO_StartingNumber { get; set; }
        public String? JIFRT_SVO_NumberofDigits { get; set; }
        public String? JIFRT_SVO_PrefilZero { get; set; }
        public String? JIFRT_SVO_Frequency { get; set; }
        public String? JIFRT_SVO_Particulars { get; set; }

        public List<JIFRT_SVO_NumberReset_DTO>? JIFRT_SVO_NumberReset { get; set; }
        public List<JIFRT_SVO_NumberPrefix_DTO>? JIFRT_SVO_NumberPrefix { get; set; }
        public List<JIFRT_SVO_NumberSuffix_DTO>? JIFRT_SVO_NumberSuffix { get; set; }

        public String? DeleteNumbers { get; set; }
        public Int32 CreatorCode { get; set; }
        public Int32 Id { get; set; }

        public void Reset()
        {
            this.JIFRT_SVO_Number = 0;
            this.JIFRT_SVO_Date = "0";
            this.JIFRT_SVO_Method = "0";
            this.JIFRT_SVO_StartingNumber = "0";
            this.JIFRT_SVO_NumberofDigits = "0";
            this.JIFRT_SVO_PrefilZero = "0";
            this.JIFRT_SVO_Frequency = "0";
            this.DeleteNumbers = "0";
            this.JIFRT_SVO_NumberReset = null;
            this.JIFRT_SVO_NumberPrefix = null;
            this.JIFRT_SVO_NumberSuffix = null;
        }
    }

    public class JIFRT_SVO_NumberReset_DTO
    {
        public Int64 JIFRT_SVO_NRS_Number { get; set; }
        public String? JIFRT_SVO_NRS_StartDate { get; set; }
        public String? JIFRT_SVO_NRS_EndDate { get; set; }
        public String? JIFRT_SVO_NRS_StartingNumber { get; set; }
        public String? JIFRT_SVO_NRS_NumberofDigits { get; set; }
        public String? JIFRT_SVO_NRS_PrefilZero { get; set; }
        public String? JIFRT_SVO_NRS_Frequency { get; set; }
        public Boolean JIFRT_SVO_NRS_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIFRT_SVO_NRS_Number = 0;
            this.JIFRT_SVO_NRS_StartDate = "";
            this.JIFRT_SVO_NRS_EndDate = "";
            this.JIFRT_SVO_NRS_StartingNumber = "";
            this.JIFRT_SVO_NRS_NumberofDigits = "";
            this.JIFRT_SVO_NRS_PrefilZero = "";
            this.JIFRT_SVO_NRS_Frequency = "";
            this.JIFRT_SVO_NRS_IsDeleted = false;
        }
    }

    public class JIFRT_SVO_NumberPrefix_DTO
    {
        public Int64 JIFRT_SVO_PFX_Number { get; set; }
        public String? JIFRT_SVO_PFX_StartDate { get; set; }
        public String? JIFRT_SVO_PFX_EndDate { get; set; }
        public String? JIFRT_SVO_PFX_Particulars { get; set; }
        public Boolean JIFRT_SVO_PFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIFRT_SVO_PFX_Number = 0;
            this.JIFRT_SVO_PFX_StartDate = "";
            this.JIFRT_SVO_PFX_EndDate = "";
            this.JIFRT_SVO_PFX_Particulars = "";
            this.JIFRT_SVO_PFX_IsDeleted = false;
        }
    }

    public class JIFRT_SVO_NumberSuffix_DTO
    {
        public Int64 JIFRT_SVO_SFX_Number { get; set; }
        public String? JIFRT_SVO_SFX_StartDate { get; set; }
        public String? JIFRT_SVO_SFX_EndDate { get; set; }
        public String? JIFRT_SVO_SFX_Particulars { get; set; }
        public Boolean JIFRT_SVO_SFX_IsDeleted { get; set; }

        public void Reset()
        {
            this.JIFRT_SVO_SFX_Number = 0;
            this.JIFRT_SVO_SFX_StartDate = "";
            this.JIFRT_SVO_SFX_EndDate = "";
            this.JIFRT_SVO_SFX_Particulars = "";
            this.JIFRT_SVO_SFX_IsDeleted = false;
        }
    }

    #endregion

    #region JIJWI/JIFRT next-number (single-call)

    public class JIJWI_SVO_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime JIJWI_SVO_Date { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalNumber { get; set; }
        public int CreatorCode { get; set; }
    }

    public class JIFRT_SVO_NextNumber_DTO
    {
        public int Id { get; set; }
        public DateTime JIFRT_SVO_Date { get; set; }
        public int NextNumber { get; set; }
        public string Prefix { get; set; }
        public string Suffix { get; set; }
        public int NumberOfDigits { get; set; }
        public bool PrefilZero { get; set; }
        public string FinalNumber { get; set; }
        public int CreatorCode { get; set; }
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

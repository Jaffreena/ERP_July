using ERP_DTO;
using ERP_DTO.JobInwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class RNNumbering_DL
    {
        public List<RNNumberReset_DTO> PORList(DataTable Dt)
        {
            List<RNNumberReset_DTO> PORList = new List<RNNumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PORList.Add(
                    new RNNumberReset_DTO
                    {
                        RNR_Number = Convert.ToInt64(dr["RNR_Number"]),
                        RNR_Date = Convert.ToString(dr["RNR_Date"]),
                        RNR_EndDate = Convert.ToString(dr["RNR_EndDate"]),
                        RNR_StartingNumber = Convert.ToString(dr["RNR_StartingNumber"]),
                        RNR_NumberofDigits = Convert.ToString(dr["RNR_NumberofDigits"]),
                        RNR_PrefilZero = Convert.ToString(dr["RNR_PrefilZero"]),
                        RNR_Frequency = Convert.ToString(dr["RNR_Frequency"])
                    });
            }
            return PORList;
        }
        public List<RNNumberPrefix_DTO> POPList(DataTable Dt)
        {
            List<RNNumberPrefix_DTO> PORList = new List<RNNumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PORList.Add(
                    new RNNumberPrefix_DTO
                    {
                        RNP_Number = Convert.ToInt64(dr["RNP_Number"]),
                        RNP_Date = Convert.ToString(dr["RNP_Date"]),
                        RNP_EndDate = Convert.ToString(dr["RNP_EndDate"]),
                        RNP_Particulars = Convert.ToString(dr["RNP_Particulars"])
                    });
            }
            return PORList;
        }
        public List<RNNumberSuffix_DTO> POSList(DataTable Dt)
        {
            List<RNNumberSuffix_DTO> PORList = new List<RNNumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PORList.Add(
                    new RNNumberSuffix_DTO  
                    {
                        RNS_Number = Convert.ToInt64(dr["RNS_Number"]),
                        RNS_Date = Convert.ToString(dr["RNS_Date"]),
                        RNS_EndDate = Convert.ToString(dr["RNS_EndDate"]),
                        RNS_Particulars = Convert.ToString(dr["RNS_Particulars"])
                    });
            }
            return PORList;
        }




        public List<RNNumberReset_DTO> PIRList(DataTable Dt)
        {
            List<RNNumberReset_DTO> PIRList = new List<RNNumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PIRList.Add(
                    new RNNumberReset_DTO
                    {
                        RNR_Number = Convert.ToInt64(dr["RNR_Number"]),
                        RNR_Date = Convert.ToString(dr["RNR_Date"]),
                        RNR_EndDate = Convert.ToString(dr["RNR_EndDate"]),
                        RNR_StartingNumber = Convert.ToString(dr["RNR_StartingNumber"]),
                        RNR_NumberofDigits = Convert.ToString(dr["RNR_NumberofDigits"]),
                        RNR_PrefilZero = Convert.ToString(dr["RNR_PrefilZero"]),
                        RNR_Frequency = Convert.ToString(dr["RNR_Frequency"])
                    });
            }
            return PIRList;
        }
        public List<RNNumberPrefix_DTO> PIPList(DataTable Dt)
        {
            List<RNNumberPrefix_DTO> PIRList = new List<RNNumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PIRList.Add(
                    new RNNumberPrefix_DTO
                    {
                        RNP_Number = Convert.ToInt64(dr["RNP_Number"]),
                        RNP_Date = Convert.ToString(dr["RNP_Date"]),
                        RNP_EndDate = Convert.ToString(dr["RNP_EndDate"]),
                        RNP_Particulars = Convert.ToString(dr["RNP_Particulars"])
                    });
            }
            return PIRList;
        }
        public List<RNNumberSuffix_DTO> PISList(DataTable Dt)
        {
            List<RNNumberSuffix_DTO> PIRList = new List<RNNumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PIRList.Add(
                    new RNNumberSuffix_DTO
                    {
                        RNS_Number = Convert.ToInt64(dr["RNS_Number"]),
                        RNS_Date = Convert.ToString(dr["RNS_Date"]),
                        RNS_EndDate = Convert.ToString(dr["RNS_EndDate"]),
                        RNS_Particulars  = Convert.ToString(dr["RNS_Particulars"])
                    });
            }
            return PIRList;
        }




        public List<RNNumberReset_DTO> PRRList(DataTable Dt)
        {
            List<RNNumberReset_DTO> PRRList = new List<RNNumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PRRList.Add(
                    new RNNumberReset_DTO
                    {
                        RNR_Number = Convert.ToInt64(dr["RNR_Number"]),
                        RNR_Date = Convert.ToString(dr["RNR_Date"]),
                        RNR_EndDate = Convert.ToString(dr["RNR_EndDate"]),
                        RNR_StartingNumber = Convert.ToString(dr["RNR_StartingNumber"]),
                        RNR_NumberofDigits = Convert.ToString(dr["RNR_NumberofDigits"]),
                        RNR_PrefilZero = Convert.ToString(dr["RNR_PrefilZero"]),
                        RNR_Frequency = Convert.ToString(dr["RNR_Frequency"])
                    });
            }
            return PRRList;
        }
        public List<RNNumberPrefix_DTO> PRPList(DataTable Dt)
        {
            List<RNNumberPrefix_DTO> PRRList = new List<RNNumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PRRList.Add(
                    new RNNumberPrefix_DTO  
                    {
                        RNP_Number = Convert.ToInt64(dr["RNP_Number"]),
                        RNP_Date = Convert.ToString(dr["RNP_Date"]),
                        RNP_EndDate = Convert.ToString(dr["RNP_EndDate"]),
                        RNP_Particulars = Convert.ToString(dr["RNP_Particulars"])
                    });
            }
            return PRRList;
        }
        public List<RNNumberSuffix_DTO> PRSList(DataTable Dt)
        {
            List<RNNumberSuffix_DTO> PRRList = new List<RNNumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PRRList.Add(
                    new RNNumberSuffix_DTO
                    {
                        RNS_Number = Convert.ToInt64(dr["RNS_Number"]),
                        RNS_Date = Convert.ToString(dr["RNS_Date"]),
                        RNS_EndDate = Convert.ToString(dr["RNS_EndDate"]),
                        RNS_Particulars = Convert.ToString(dr["RNS_Particulars"])
                    });
            }
            return PRRList;
        }

    }

    public class DNNumbering_DL
    {
        public List<DNNumberReset_DTO> DORList(DataTable Dt)
        {
            List<DNNumberReset_DTO> DORList = new List<DNNumberReset_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                DORList.Add(
                    new DNNumberReset_DTO
                    {
                        DNR_Number = Convert.ToInt64(dr["DNR_Number"]),
                        DNR_Date = Convert.ToString(dr["DNR_Date"]),
                        DNR_EndDate = Convert.ToString(dr["DNR_EndDate"]),
                        DNR_StartingNumber = Convert.ToString(dr["DNR_StartingNumber"]),
                        DNR_NumberofDigits = Convert.ToString(dr["DNR_NumberofDigits"]),
                        DNR_PrefilZero = Convert.ToString(dr["DNR_PrefilZero"]),
                        DNR_Frequency = Convert.ToString(dr["DNR_Frequency"])
                    });
            }

            return DORList;
        }

        public List<DNNumberPrefix_DTO> DOPList(DataTable Dt)
        {
            List<DNNumberPrefix_DTO> DOPList = new List<DNNumberPrefix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                DOPList.Add(
                    new DNNumberPrefix_DTO
                    {
                        DNP_Number = Convert.ToInt64(dr["DNP_Number"]),
                        DNP_Date = Convert.ToString(dr["DNP_Date"]),
                        DNP_EndDate = Convert.ToString(dr["DNP_EndDate"]),
                        DNP_Particulars = Convert.ToString(dr["DNP_Particulars"])
                    });
            }

            return DOPList;
        }

        public List<DNNumberSuffix_DTO> DOSList(DataTable Dt)
        {
            List<DNNumberSuffix_DTO> DOSList = new List<DNNumberSuffix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                DOSList.Add(
                    new DNNumberSuffix_DTO
                    {
                        DNS_Number = Convert.ToInt64(dr["DNS_Number"]),
                        DNS_Date = Convert.ToString(dr["DNS_Date"]),
                        DNS_EndDate = Convert.ToString(dr["DNS_EndDate"]),
                        DNS_Particulars = Convert.ToString(dr["DNS_Particulars"])
                    });
            }

            return DOSList;
        }
    }
    public class JINumbering_DL
    {
        public List<JINumberReset_DTO> JORList(DataTable Dt)
        {
            List<JINumberReset_DTO> JORList = new List<JINumberReset_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JORList.Add(
                    new JINumberReset_DTO
                    {
                        JIR_Number = Convert.ToInt64(dr["JIR_Number"]),
                        JIR_Date = Convert.ToString(dr["JIR_Date"]),
                        JIR_EndDate = Convert.ToString(dr["JIR_EndDate"]),
                        JIR_StartingNumber = Convert.ToString(dr["JIR_StartingNumber"]),
                        JIR_NumberofDigits = Convert.ToString(dr["JIR_NumberofDigits"]),
                        JIR_PrefilZero = Convert.ToString(dr["JIR_PrefilZero"]),
                        JIR_Frequency = Convert.ToString(dr["JIR_Frequency"])
                    });
            }

            return JORList;
        }

        public List<JINumberPrefix_DTO> JOPList(DataTable Dt)
        {
            List<JINumberPrefix_DTO> JOPList = new List<JINumberPrefix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JOPList.Add(
                    new JINumberPrefix_DTO
                    {
                        JIP_Number = Convert.ToInt64(dr["JIP_Number"]),
                        JIP_Date = Convert.ToString(dr["JIP_Date"]),
                        JIP_EndDate = Convert.ToString(dr["JIP_EndDate"]),
                        JIP_Particulars = Convert.ToString(dr["JIP_Particulars"])
                    });
            }

            return JOPList;
        }

        public List<JINumberSuffix_DTO> JOSList(DataTable Dt)
        {
            List<JINumberSuffix_DTO> JOSList = new List<JINumberSuffix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JOSList.Add(
                    new JINumberSuffix_DTO
                    {
                        JIS_Number = Convert.ToInt64(dr["JIS_Number"]),
                        JIS_Date = Convert.ToString(dr["JIS_Date"]),
                        JIS_EndDate = Convert.ToString(dr["JIS_EndDate"]),
                        JIS_Particulars = Convert.ToString(dr["JIS_Particulars"])
                    });
            }

            return JOSList;
        }
    }
    public class JSONumbering_DL
    {
        public List<JSONumberReset_DTO> JSORList(DataTable Dt)
        {
            List<JSONumberReset_DTO> JSORList = new List<JSONumberReset_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JSORList.Add(
                    new JSONumberReset_DTO
                    {
                        JSOR_Number = Convert.ToInt64(dr["JSOR_Number"]),
                        JSOR_Date = Convert.ToString(dr["JSOR_Date"]),
                        JSOR_EndDate = Convert.ToString(dr["JSOR_EndDate"]),
                        JSOR_StartingNumber = Convert.ToString(dr["JSOR_StartingNumber"]),
                        JSOR_NumberofDigits = Convert.ToString(dr["JSOR_NumberofDigits"]),
                        JSOR_PrefilZero = Convert.ToString(dr["JSOR_PrefilZero"]),
                        JSOR_Frequency = Convert.ToString(dr["JSOR_Frequency"])
                    });
            }

            return JSORList;
        }

        public List<JSONumberPrefix_DTO> JSOPList(DataTable Dt)
        {
            List<JSONumberPrefix_DTO> JSOPList = new List<JSONumberPrefix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JSOPList.Add(
                    new JSONumberPrefix_DTO
                    {
                        JSOP_Number = Convert.ToInt64(dr["JSOP_Number"]),
                        JSOP_Date = Convert.ToString(dr["JSOP_Date"]),
                        JSOP_EndDate = Convert.ToString(dr["JSOP_EndDate"]),
                        JSOP_Particulars = Convert.ToString(dr["JSOP_Particulars"])
                    });
            }

            return JSOPList;
        }

        public List<JSONumberSuffix_DTO> JSOSList(DataTable Dt)
        {
            List<JSONumberSuffix_DTO> JSOSList = new List<JSONumberSuffix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JSOSList.Add(
                    new JSONumberSuffix_DTO
                    {
                        JSOS_Number = Convert.ToInt64(dr["JSOS_Number"]),
                        JSOS_Date = Convert.ToString(dr["JSOS_Date"]),
                        JSOS_EndDate = Convert.ToString(dr["JSOS_EndDate"]),
                        JSOS_Particulars = Convert.ToString(dr["JSOS_Particulars"])
                    });
            }

            return JSOSList;
        }
    }
    public class JI_CONVNumbering_DL
    {
        public List<JI_CONVNumberReset_DTO> JICRList(DataTable Dt)
        {
            List<JI_CONVNumberReset_DTO> JICRList = new List<JI_CONVNumberReset_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JICRList.Add(
                    new JI_CONVNumberReset_DTO
                    {
                        JICR_Number = Convert.ToInt64(dr["JICR_Number"]),
                        JICR_Date = Convert.ToString(dr["JICR_Date"]),
                        JICR_EndDate = Convert.ToString(dr["JICR_EndDate"]),
                        JICR_StartingNumber = Convert.ToString(dr["JICR_StartingNumber"]),
                        JICR_NumberofDigits = Convert.ToString(dr["JICR_NumberofDigits"]),
                        JICR_PrefilZero = Convert.ToString(dr["JICR_PrefilZero"]),
                        JICR_Frequency = Convert.ToString(dr["JICR_Frequency"])
                    });
            }

            return JICRList;
        }

        public List<JI_CONVNumberPrefix_DTO> JICPList(DataTable Dt)
        {
            List<JI_CONVNumberPrefix_DTO> JICPList = new List<JI_CONVNumberPrefix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JICPList.Add(
                    new JI_CONVNumberPrefix_DTO
                    {
                        JICP_Number = Convert.ToInt64(dr["JICP_Number"]),
                        JICP_Date = Convert.ToString(dr["JICP_Date"]),
                        JICP_EndDate = Convert.ToString(dr["JICP_EndDate"]),
                        JICP_Particulars = Convert.ToString(dr["JICP_Particulars"])
                    });
            }

            return JICPList;
        }

        public List<JI_CONVNumberSuffix_DTO> JICSList(DataTable Dt)
        {
            List<JI_CONVNumberSuffix_DTO> JICSList = new List<JI_CONVNumberSuffix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JICSList.Add(
                    new JI_CONVNumberSuffix_DTO
                    {
                        JICS_Number = Convert.ToInt64(dr["JICS_Number"]),
                        JICS_Date = Convert.ToString(dr["JICS_Date"]),
                        JICS_EndDate = Convert.ToString(dr["JICS_EndDate"]),
                        JICS_Particulars = Convert.ToString(dr["JICS_Particulars"])
                    });
            }

            return JICSList;
        }
    }

}

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

    public class JIRN_Numbering_DL
    {
        public List<JIRN_NumberReset_DTO> PORList(DataTable Dt)
        {
            List<JIRN_NumberReset_DTO> PORList = new List<JIRN_NumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PORList.Add(
                    new JIRN_NumberReset_DTO
                    {
                        JIRN_NRS_Number = Convert.ToInt64(dr["JIRN_NRS_Number"]),
                        JIRN_NRS_StartDate = Convert.ToString(dr["JIRN_NRS_StartDate"]),
                        JIRN_NRS_EndDate = Convert.ToString(dr["JIRN_NRS_EndDate"]),
                        JIRN_NRS_StartingNumber = Convert.ToString(dr["JIRN_NRS_StartingNumber"]),
                        JIRN_NRS_NumberofDigits = Convert.ToString(dr["JIRN_NRS_NumberofDigits"]),
                        JIRN_NRS_PrefilZero = Convert.ToString(dr["JIRN_NRS_PrefilZero"]),
                        JIRN_NRS_Frequency = Convert.ToString(dr["JIRN_NRS_Frequency"])
                    });
            }
            return PORList;
        }
        public List<JIRN_NumberPrefix_DTO> POPList(DataTable Dt)
        {
            List<JIRN_NumberPrefix_DTO> PORList = new List<JIRN_NumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PORList.Add(
                    new JIRN_NumberPrefix_DTO
                    {
                        JIRN_PFX_Number = Convert.ToInt64(dr["JIRN_PFX_Number"]),
                        JIRN_PFX_StartDate = Convert.ToString(dr["JIRN_PFX_StartDate"]),
                        JIRN_PFX_EndDate = Convert.ToString(dr["JIRN_PFX_EndDate"]),
                        JIRN_PFX_Particulars = Convert.ToString(dr["JIRN_PFX_Particulars"])
                    });
            }
            return PORList;
        }
        public List<JIRN_NumberSuffix_DTO> POSList(DataTable Dt)
        {
            List<JIRN_NumberSuffix_DTO> PORList = new List<JIRN_NumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PORList.Add(
                    new JIRN_NumberSuffix_DTO
                    {
                        JIRN_SFX_Number = Convert.ToInt64(dr["JIRN_SFX_Number"]),
                        JIRN_SFX_StartDate = Convert.ToString(dr["JIRN_SFX_StartDate"]),
                        JIRN_SFX_EndDate = Convert.ToString(dr["JIRN_SFX_EndDate"]),
                        JIRN_SFX_Particulars = Convert.ToString(dr["JIRN_SFX_Particulars"])
                    });
            }
            return PORList;
        }




        public List<JIRN_NumberReset_DTO> PIRList(DataTable Dt)
        {
            List<JIRN_NumberReset_DTO> PIRList = new List<JIRN_NumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PIRList.Add(
                    new JIRN_NumberReset_DTO
                    {
                        JIRN_NRS_Number = Convert.ToInt64(dr["JIRN_NRS_Number"]),
                        JIRN_NRS_StartDate = Convert.ToString(dr["JIRN_NRS_StartDate"]),
                        JIRN_NRS_EndDate = Convert.ToString(dr["JIRN_NRS_EndDate"]),
                        JIRN_NRS_StartingNumber = Convert.ToString(dr["JIRN_NRS_StartingNumber"]),
                        JIRN_NRS_NumberofDigits = Convert.ToString(dr["JIRN_NRS_NumberofDigits"]),
                        JIRN_NRS_PrefilZero = Convert.ToString(dr["JIRN_NRS_PrefilZero"]),
                        JIRN_NRS_Frequency = Convert.ToString(dr["JIRN_NRS_Frequency"])
                    });
            }
            return PIRList;
        }
        public List<JIRN_NumberPrefix_DTO> PIPList(DataTable Dt)
        {
            List<JIRN_NumberPrefix_DTO> PIRList = new List<JIRN_NumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PIRList.Add(
                    new JIRN_NumberPrefix_DTO
                    {
                        JIRN_PFX_Number = Convert.ToInt64(dr["JIRN_PFX_Number"]),
                        JIRN_PFX_StartDate = Convert.ToString(dr["JIRN_PFX_StartDate"]),
                        JIRN_PFX_EndDate = Convert.ToString(dr["JIRN_PFX_EndDate"]),
                        JIRN_PFX_Particulars = Convert.ToString(dr["JIRN_PFX_Particulars"])
                    });
            }
            return PIRList;
        }
        public List<JIRN_NumberSuffix_DTO> PISList(DataTable Dt)
        {
            List<JIRN_NumberSuffix_DTO> PIRList = new List<JIRN_NumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PIRList.Add(
                    new JIRN_NumberSuffix_DTO
                    {
                        JIRN_SFX_Number = Convert.ToInt64(dr["JIRN_SFX_Number"]),
                        JIRN_SFX_StartDate = Convert.ToString(dr["JIRN_SFX_StartDate"]),
                        JIRN_SFX_EndDate = Convert.ToString(dr["JIRN_SFX_EndDate"]),
                        JIRN_SFX_Particulars = Convert.ToString(dr["JIRN_SFX_Particulars"])
                    });
            }
            return PIRList;
        }




        public List<JIRN_NumberReset_DTO> PRRList(DataTable Dt)
        {
            List<JIRN_NumberReset_DTO> PRRList = new List<JIRN_NumberReset_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PRRList.Add(
                    new JIRN_NumberReset_DTO
                    {
                        JIRN_NRS_Number = Convert.ToInt64(dr["JIRN_NRS_Number"]),
                        JIRN_NRS_StartDate = Convert.ToString(dr["JIRN_NRS_StartDate"]),
                        JIRN_NRS_EndDate = Convert.ToString(dr["JIRN_NRS_EndDate"]),
                        JIRN_NRS_StartingNumber = Convert.ToString(dr["JIRN_NRS_StartingNumber"]),
                        JIRN_NRS_NumberofDigits = Convert.ToString(dr["JIRN_NRS_NumberofDigits"]),
                        JIRN_NRS_PrefilZero = Convert.ToString(dr["JIRN_NRS_PrefilZero"]),
                        JIRN_NRS_Frequency = Convert.ToString(dr["JIRN_NRS_Frequency"])
                    });
            }
            return PRRList;
        }
        public List<JIRN_NumberPrefix_DTO> PRPList(DataTable Dt)
        {
            List<JIRN_NumberPrefix_DTO> PRRList = new List<JIRN_NumberPrefix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PRRList.Add(
                    new JIRN_NumberPrefix_DTO
                    {
                        JIRN_PFX_Number = Convert.ToInt64(dr["JIRN_PFX_Number"]),
                        JIRN_PFX_StartDate = Convert.ToString(dr["JIRN_PFX_StartDate"]),
                        JIRN_PFX_EndDate = Convert.ToString(dr["JIRN_PFX_EndDate"]),
                        JIRN_PFX_Particulars = Convert.ToString(dr["JIRN_PFX_Particulars"])
                    });
            }
            return PRRList;
        }
        public List<JIRN_NumberSuffix_DTO> PRSList(DataTable Dt)
        {
            List<JIRN_NumberSuffix_DTO> PRRList = new List<JIRN_NumberSuffix_DTO>();
            foreach (DataRow dr in Dt.Rows)
            {
                PRRList.Add(
                    new JIRN_NumberSuffix_DTO
                    {
                        JIRN_SFX_Number = Convert.ToInt64(dr["JIRN_SFX_Number"]),
                        JIRN_SFX_StartDate = Convert.ToString(dr["JIRN_SFX_StartDate"]),
                        JIRN_SFX_EndDate = Convert.ToString(dr["JIRN_SFX_EndDate"]),
                        JIRN_SFX_Particulars = Convert.ToString(dr["JIRN_SFX_Particulars"])
                    });
            }
            return PRRList;
        }

    }
    public class JIDN_Numbering_DL
    {
        public List<JIDN_NumberReset_DTO> JIDN_NRList(DataTable Dt)
        {
            List<JIDN_NumberReset_DTO> JIDN_NRList = new List<JIDN_NumberReset_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JIDN_NRList.Add(
                    new JIDN_NumberReset_DTO
                    {
                        JIDN_NR_Number = Convert.ToInt64(dr["JIDN_NR_Number"]),
                        JIDN_NR_Date = Convert.ToString(dr["JIDN_NR_Date"]),
                        JIDN_NR_EndDate = Convert.ToString(dr["JIDN_NR_EndDate"]),
                        JIDN_NR_StartingNumber = Convert.ToString(dr["JIDN_NR_StartingNumber"]),
                        JIDN_NR_NumberofDigits = Convert.ToString(dr["JIDN_NR_NumberofDigits"]),
                        JIDN_NR_PrefilZero = Convert.ToString(dr["JIDN_NR_PrefilZero"]),
                        JIDN_NR_Frequency = Convert.ToString(dr["JIDN_NR_Frequency"])
                    }
                );
            }

            return JIDN_NRList;
        }

        public List<JIDN_NumberPrefix_DTO> JIDN_PrefixList(DataTable Dt)
        {
            List<JIDN_NumberPrefix_DTO> JIDN_PrefixList = new List<JIDN_NumberPrefix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JIDN_PrefixList.Add(
                    new JIDN_NumberPrefix_DTO
                    {
                        JIDN_Prefix_Number = Convert.ToInt64(dr["JIDN_Prefix_Number"]),
                        JIDN_Prefix_Date = Convert.ToString(dr["JIDN_Prefix_Date"]),
                        JIDN_Prefix_EndDate = Convert.ToString(dr["JIDN_Prefix_EndDate"]),
                        JIDN_Prefix_Particulars = Convert.ToString(dr["JIDN_Prefix_Particulars"])
                    }
                );
            }

            return JIDN_PrefixList;
        }

        public List<JIDN_NumberSuffix_DTO> JIDN_SuffixList(DataTable Dt)
        {
            List<JIDN_NumberSuffix_DTO> JIDN_SuffixList = new List<JIDN_NumberSuffix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JIDN_SuffixList.Add(
                    new JIDN_NumberSuffix_DTO
                    {
                        JIDN_Suffix_Number = Convert.ToInt64(dr["JIDN_Suffix_Number"]),
                        JIDN_Suffix_Date = Convert.ToString(dr["JIDN_Suffix_Date"]),
                        JIDN_Suffix_EndDate = Convert.ToString(dr["JIDN_Suffix_EndDate"]),
                        JIDN_Suffix_Particulars = Convert.ToString(dr["JIDN_Suffix_Particulars"])
                    }
                );
            }

            return JIDN_SuffixList;
        }
    }
    public class JIJWI_Numbering_DL
    {
        public List<JIJWI_NumberReset_DTO> JORList(DataTable Dt)
        {
            List<JIJWI_NumberReset_DTO> JORList = new List<JIJWI_NumberReset_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JORList.Add(
                    new JIJWI_NumberReset_DTO
                    {
                        JIJWI__NRS_Number = Convert.ToInt64(dr["JIJWI__NRS_Number"]),
                        JIJWI__NRS_StartDate = Convert.ToString(dr["JIJWI__NRS_StartDate"]),
                        JIJWI__NRS_EndDate = Convert.ToString(dr["JIJWI__NRS_EndDate"]),
                        JIJWI__NRS_StartingNumber = Convert.ToString(dr["JIJWI__NRS_StartingNumber"]),
                        JIJWI__NRS_NumberofDigits = Convert.ToString(dr["JIJWI__NRS_NumberofDigits"]),
                        JIJWI__NRS_PrefilZero = Convert.ToString(dr["JIJWI__NRS_PrefilZero"]),
                        JIJWI__NRS_Frequency = Convert.ToString(dr["JIJWI__NRS_Frequency"])
                    });
            }

            return JORList;
        }

        public List<JIJWI_NumberPrefix_DTO> JOPList(DataTable Dt)
        {
            List<JIJWI_NumberPrefix_DTO> JOPList = new List<JIJWI_NumberPrefix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JOPList.Add(
                    new JIJWI_NumberPrefix_DTO
                    {
                        JIJWI_PFX_Number = Convert.ToInt64(dr["JIJWI_PFX_Number"]),
                        JIJWI_PFX_StartDate = Convert.ToString(dr["JIJWI_PFX_StartDate"]),
                        JIJWI_PFX_EndDate = Convert.ToString(dr["JIJWI_PFX_EndDate"]),
                        JIJWI_PFX_Particulars = Convert.ToString(dr["JIJWI_PFX_Particulars"])
                    });
            }

            return JOPList;
        }

        public List<JIJWI_NumberSuffix_DTO> JOSList(DataTable Dt)
        {
            List<JIJWI_NumberSuffix_DTO> JOSList = new List<JIJWI_NumberSuffix_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JOSList.Add(
                    new JIJWI_NumberSuffix_DTO
                    {
                        JIJWI_SFX_Number = Convert.ToInt64(dr["JIJWI_SFX_Number"]),
                        JIJWI_SFX_StartDate = Convert.ToString(dr["JIJWI_SFX_StartDate"]),
                        JIJWI_SFX_EndDate = Convert.ToString(dr["JIJWI_SFX_EndDate"]),
                        JIJWI_SFX_Particulars = Convert.ToString(dr["JIJWI_SFX_Particulars"])
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
        public class JIJWI_SVO_Numbering_DL
        {
            public List<JIJWI_SVO_NumberReset_DTO> JIJWI_SVO_NRSList(DataTable Dt)
            {
                List<JIJWI_SVO_NumberReset_DTO> JIJWI_SVO_NRSList = new List<JIJWI_SVO_NumberReset_DTO>();

                foreach (DataRow dr in Dt.Rows)
                {
                    JIJWI_SVO_NRSList.Add(
                        new JIJWI_SVO_NumberReset_DTO
                        {
                            JIJWI_SVO_NRS_Number = Convert.ToInt64(dr["JIJWI_SVO_NRS_Number"]),
                            JIJWI_SVO_NRS_StartDate = Convert.ToString(dr["JIJWI_SVO_NRS_StartDate"]),
                            JIJWI_SVO_NRS_EndDate = Convert.ToString(dr["JIJWI_SVO_NRS_EndDate"]),
                            JIJWI_SVO_NRS_StartingNumber = Convert.ToString(dr["JIJWI_SVO_NRS_StartingNumber"]),
                            JIJWI_SVO_NRS_NumberofDigits = Convert.ToString(dr["JIJWI_SVO_NRS_NumberofDigits"]),
                            JIJWI_SVO_NRS_PrefilZero = Convert.ToString(dr["JIJWI_SVO_NRS_PrefilZero"]),
                            JIJWI_SVO_NRS_Frequency = Convert.ToString(dr["JIJWI_SVO_NRS_Frequency"])
                        });
                }

                return JIJWI_SVO_NRSList;
            }

            public List<JIJWI_SVO_NumberPrefix_DTO> JIJWI_SVO_PFXList(DataTable Dt)
            {
                List<JIJWI_SVO_NumberPrefix_DTO> JIJWI_SVO_PFXList = new List<JIJWI_SVO_NumberPrefix_DTO>();

                foreach (DataRow dr in Dt.Rows)
                {
                    JIJWI_SVO_PFXList.Add(
                        new JIJWI_SVO_NumberPrefix_DTO
                        {
                            JIJWI_SVO_PFX_Number = Convert.ToInt64(dr["JIJWI_SVO_PFX_Number"]),
                            JIJWI_SVO_PFX_StartDate = Convert.ToString(dr["JIJWI_SVO_PFX_StartDate"]),
                            JIJWI_SVO_PFX_EndDate = Convert.ToString(dr["JIJWI_SVO_PFX_EndDate"]),
                            JIJWI_SVO_PFX_Particulars = Convert.ToString(dr["JIJWI_SVO_PFX_Particulars"])
                        });
                }

                return JIJWI_SVO_PFXList;
            }

            public List<JIJWI_SVO_NumberSuffix_DTO> JIJWI_SVO_SFXList(DataTable Dt)
            {
                List<JIJWI_SVO_NumberSuffix_DTO> JIJWI_SVO_SFXList = new List<JIJWI_SVO_NumberSuffix_DTO>();

                foreach (DataRow dr in Dt.Rows)
                {
                    JIJWI_SVO_SFXList.Add(
                        new JIJWI_SVO_NumberSuffix_DTO
                        {
                            JIJWI_SVO_SFX_Number = Convert.ToInt64(dr["JIJWI_SVO_SFX_Number"]),
                            JIJWI_SVO_SFX_StartDate = Convert.ToString(dr["JIJWI_SVO_SFX_StartDate"]),
                            JIJWI_SVO_SFX_EndDate = Convert.ToString(dr["JIJWI_SVO_SFX_EndDate"]),
                            JIJWI_SVO_SFX_Particulars = Convert.ToString(dr["JIJWI_SVO_SFX_Particulars"])
                        });
                }

                return JIJWI_SVO_SFXList;
            }
        }

        public class JIFRT_SVO_Numbering_DL
        {
            public List<JIFRT_SVO_NumberReset_DTO> JIFRT_SVO_NRSList(DataTable Dt)
            {
                List<JIFRT_SVO_NumberReset_DTO> JIFRT_SVO_NRSList = new List<JIFRT_SVO_NumberReset_DTO>();

                foreach (DataRow dr in Dt.Rows)
                {
                    JIFRT_SVO_NRSList.Add(
                        new JIFRT_SVO_NumberReset_DTO
                        {
                            JIFRT_SVO_NRS_Number = Convert.ToInt64(dr["JIFRT_SVO_NRS_Number"]),
                            JIFRT_SVO_NRS_StartDate = Convert.ToString(dr["JIFRT_SVO_NRS_StartDate"]),
                            JIFRT_SVO_NRS_EndDate = Convert.ToString(dr["JIFRT_SVO_NRS_EndDate"]),
                            JIFRT_SVO_NRS_StartingNumber = Convert.ToString(dr["JIFRT_SVO_NRS_StartingNumber"]),
                            JIFRT_SVO_NRS_NumberofDigits = Convert.ToString(dr["JIFRT_SVO_NRS_NumberofDigits"]),
                            JIFRT_SVO_NRS_PrefilZero = Convert.ToString(dr["JIFRT_SVO_NRS_PrefilZero"]),
                            JIFRT_SVO_NRS_Frequency = Convert.ToString(dr["JIFRT_SVO_NRS_Frequency"])
                        });
                }

                return JIFRT_SVO_NRSList;
            }

            public List<JIFRT_SVO_NumberPrefix_DTO> JIFRT_SVO_PFXList(DataTable Dt)
            {
                List<JIFRT_SVO_NumberPrefix_DTO> JIFRT_SVO_PFXList = new List<JIFRT_SVO_NumberPrefix_DTO>();

                foreach (DataRow dr in Dt.Rows)
                {
                    JIFRT_SVO_PFXList.Add(
                        new JIFRT_SVO_NumberPrefix_DTO
                        {
                            JIFRT_SVO_PFX_Number = Convert.ToInt64(dr["JIFRT_SVO_PFX_Number"]),
                            JIFRT_SVO_PFX_StartDate = Convert.ToString(dr["JIFRT_SVO_PFX_StartDate"]),
                            JIFRT_SVO_PFX_EndDate = Convert.ToString(dr["JIFRT_SVO_PFX_EndDate"]),
                            JIFRT_SVO_PFX_Particulars = Convert.ToString(dr["JIFRT_SVO_PFX_Particulars"])
                        });
                }

                return JIFRT_SVO_PFXList;
            }

            public List<JIFRT_SVO_NumberSuffix_DTO> JIFRT_SVO_SFXList(DataTable Dt)
            {
                List<JIFRT_SVO_NumberSuffix_DTO> JIFRT_SVO_SFXList = new List<JIFRT_SVO_NumberSuffix_DTO>();

                foreach (DataRow dr in Dt.Rows)
                {
                    JIFRT_SVO_SFXList.Add(
                        new JIFRT_SVO_NumberSuffix_DTO
                        {
                            JIFRT_SVO_SFX_Number = Convert.ToInt64(dr["JIFRT_SVO_SFX_Number"]),
                            JIFRT_SVO_SFX_StartDate = Convert.ToString(dr["JIFRT_SVO_SFX_StartDate"]),
                            JIFRT_SVO_SFX_EndDate = Convert.ToString(dr["JIFRT_SVO_SFX_EndDate"]),
                            JIFRT_SVO_SFX_Particulars = Convert.ToString(dr["JIFRT_SVO_SFX_Particulars"])
                        });
                }

                return JIFRT_SVO_SFXList;
            }
        }

    
}

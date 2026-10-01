using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JO_WorkCentreGroup_DL
    {
        // List (SP Id 2, Table 0)  -> Under = parent name / "Primary"
        public List<JO_WorkCentreGroup_DTO> JO_WorkCentreGroupList(DataTable Dt)
        {
            List<JO_WorkCentreGroup_DTO> JWCG_List = new List<JO_WorkCentreGroup_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JWCG_List.Add(
                    new JO_WorkCentreGroup_DTO
                    {
                        JWCG_Number = Convert.ToInt64(dr["JWCG_Number"]),
                        JWCG_JW_WorkCentreGroup = Convert.ToString(dr["JWCG_JW_WorkCentreGroup"]),
                        JWCG_Description = Convert.ToString(dr["JWCG_Description"]),
                        JWCG_Under_JWCG_Number = Convert.ToString(dr["JWCG_Under_JWCG_Number"])
                    });
            }

            return JWCG_List;
        }

        // Edit (SP Id 4)  -> Under = parent Number (as string, 0 = Primary)
        public List<JO_WorkCentreGroup_DTO> JO_WorkCentreGroupEdit(DataTable Dt)
        {
            List<JO_WorkCentreGroup_DTO> JWCG_List = new List<JO_WorkCentreGroup_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JWCG_List.Add(
                    new JO_WorkCentreGroup_DTO
                    {
                        JWCG_Number = Convert.ToInt64(dr["JWCG_Number"]),
                        JWCG_JW_WorkCentreGroup = Convert.ToString(dr["JWCG_JW_WorkCentreGroup"]),
                        JWCG_Description = Convert.ToString(dr["JWCG_Description"]),
                        JWCG_Under_JWCG_Number = Convert.ToString(dr["JWCG_Under_JWCG_Number"])
                    });
            }

            return JWCG_List;
        }
    }
}

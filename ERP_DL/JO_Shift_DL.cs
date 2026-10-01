using ERP_DTO.JobOutwardTransaction;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP_DL
{
    public class JO_Shift_DL
    {
        // List (SP Id 2, Table 0)
        public List<JO_Shift_DTO> JO_ShiftList(DataTable Dt)
        {
            List<JO_Shift_DTO> JSFT_List = new List<JO_Shift_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JSFT_List.Add(
                    new JO_Shift_DTO
                    {
                        JSFT_Number = Convert.ToInt64(dr["JSFT_Number"]),
                        JSFT_ShiftName = Convert.ToString(dr["JSFT_ShiftName"]),
                        JSFT_Description = Convert.ToString(dr["JSFT_Description"])
                    });
            }

            return JSFT_List;
        }

        // Edit (SP Id 4)
        public List<JO_Shift_DTO> JO_ShiftEdit(DataTable Dt)
        {
            List<JO_Shift_DTO> JSFT_List = new List<JO_Shift_DTO>();

            foreach (DataRow dr in Dt.Rows)
            {
                JSFT_List.Add(
                    new JO_Shift_DTO
                    {
                        JSFT_Number = Convert.ToInt64(dr["JSFT_Number"]),
                        JSFT_ShiftName = Convert.ToString(dr["JSFT_ShiftName"]),
                        JSFT_Description = Convert.ToString(dr["JSFT_Description"])
                    });
            }

            return JSFT_List;
        }
    }
}

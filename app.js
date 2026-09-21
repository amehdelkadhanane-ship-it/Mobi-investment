const API=(window.CONTIX_CONFIG?.API_BASE_URL||"").replace(/\/$/,"");
const money=n=>new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(n);
let products=[], cart=JSON.parse(localStorage.getItem("contix_cart")||"[]"), messages=[];

function saveCart(){localStorage.setItem("contix_cart",JSON.stringify(cart));updateCartCount();}
function updateCartCount(){const e=document.getElementById("cartCount");if(e)e.textContent=cart.reduce((a,x)=>a+x.qty,0);}
function addCart(p){const x=cart.find(i=>i.id===p.id);if(x)x.qty++;else cart.push({id:p.id,name:p.name,price:p.price,image:p.images?.[0]||"",qty:1});saveCart();alert("Added to cart.");}
async function loadProducts(q=""){const r=await fetch(API+"/api/products"+(q?("?q="+encodeURIComponent(q)):""));products=await r.json();render();}
function render(){
 const grid=document.getElementById("products"); if(!grid)return;
 let list=[...products]; const sort=document.getElementById("sort")?.value;
 if(sort==="low")list.sort((a,b)=>a.price-b.price); if(sort==="high")list.sort((a,b)=>b.price-a.price); if(sort==="new")list.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));
 grid.innerHTML=list.map(p=>`<article class="card"><div class="pic"><img src="${p.images?.[0]||"https://via.placeholder.com/600x600?text=CONTIX"}" alt="${escapeHtml(p.name)}"></div><div class="cardbody"><span class="tag">${escapeHtml(p.brand)} • ${escapeHtml(p.category)} • ${p.stock} in stock</span><h3>${escapeHtml(p.name)}</h3><div class="price">${money(p.price)} ${p.old_price?`<span class="old">${money(p.old_price)}</span>`:""}</div><div class="actions"><button onclick='addCart(${JSON.stringify(p).replace(/'/g,"&#39;")})'>Add to cart</button><a href="cart.html">Checkout</a></div></div></article>`).join("");
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));}

async function sendAI(){
 const input=document.getElementById("chatInput"), box=document.getElementById("messages"); if(!input||!input.value.trim())return;
 const text=input.value.trim(); input.value=""; messages.push({role:"user",content:text}); box.innerHTML+=`<div class="user">${escapeHtml(text)}</div>`;
 const r=await fetch(API+"/api/ai/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages})}); const d=await r.json(); const answer=d.answer||"I couldn't answer that right now."; messages.push({role:"assistant",content:answer}); box.innerHTML+=`<div class="ai">${escapeHtml(answer)}</div>`; box.scrollTop=box.scrollHeight;
}
async function handover(){
 const message=prompt("Tell the store team what you need. Your message will be saved for the owner."); if(!message)return;
 const name=prompt("Your name (optional):")||""; const email=prompt("Your email (optional):")||"";
 await fetch(API+"/api/ai/handover",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer_name:name,email,message})});
 alert("Your request has been handed to the store team.");
}

function cartPage(){
 const el=document.getElementById("cart"); if(!el)return;
 const panel=document.getElementById("checkoutPanel");
 const total=cart.reduce((a,x)=>a+x.price*x.qty,0);
 el.innerHTML=cart.length?cart.map(x=>`<div class="line"><img src="${x.image||"https://via.placeholder.com/100"}"><div style="flex:1"><b>${escapeHtml(x.name)}</b><div>${money(x.price)} × <input style="width:60px" type="number" min="1" value="${x.qty}" onchange="setQty(${x.id},this.value)"></div></div><button onclick="removeItem(${x.id})">Remove</button></div>`).join(""):"<p>Your cart is empty.</p>";
 panel.innerHTML=cart.length?`<div class="checkoutform"><h2>Total: ${money(total)}</h2><input id="cname" placeholder="Full name"><input id="cemail" type="email" placeholder="Email"><input id="cphone" placeholder="Phone"><input id="caddress" placeholder="Delivery address"><input id="ccity" placeholder="City"><input id="cstate" placeholder="State"><button onclick="checkout()">Continue to secure payment</button></div>`:"";
}
function setQty(id,q){const x=cart.find(i=>i.id===id);if(x)x.qty=Math.max(1,Number(q||1));saveCart();cartPage();}
function removeItem(id){cart=cart.filter(x=>x.id!==id);saveCart();cartPage();}
async function checkout(){
 const customer={name:document.getElementById("cname").value,email:document.getElementById("cemail").value,phone:document.getElementById("cphone").value,address:document.getElementById("caddress").value,city:document.getElementById("ccity").value,state:document.getElementById("cstate").value};
 if(!customer.name||!customer.email||!customer.address)return alert("Please complete your name, email and delivery address.");
 const r=await fetch(API+"/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({customer,items:cart.map(x=>({id:x.id,qty:x.qty}))})});const order=await r.json();if(!r.ok)return alert(order.error||"Could not create order.");
 const p=await fetch(API+"/api/paystack/initialize",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reference:order.reference,email:customer.email})});const data=await p.json();if(!p.ok)return alert(data.error||"Could not initialize payment.");
 location.href=data.authorization_url;
}
document.addEventListener("DOMContentLoaded",()=>{
 updateCartCount();
 if(document.getElementById("products")){loadProducts();document.getElementById("searchForm").onsubmit=e=>{e.preventDefault();loadProducts(document.getElementById("search").value)}} 
 document.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>loadProducts(b.dataset.cat?b.dataset.cat:""));
 document.getElementById("sort")?.addEventListener("change",render);
 document.getElementById("chatToggle")?.addEventListener("click",()=>document.querySelector(".chatbox").classList.remove("hidden"));
 document.getElementById("chatClose")?.addEventListener("click",()=>document.querySelector(".chatbox").classList.add("hidden"));
 document.getElementById("chatSend")?.addEventListener("click",sendAI);
 document.getElementById("chatInput")?.addEventListener("keydown",e=>{if(e.key==="Enter")sendAI()});
 document.getElementById("humanBtn")?.addEventListener("click",handover);
 cartPage();
});
